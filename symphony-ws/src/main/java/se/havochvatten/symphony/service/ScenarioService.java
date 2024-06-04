package se.havochvatten.symphony.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.tuple.Pair;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.GridGeometry2D;
import org.geotools.data.geojson.GeoJSONWriter;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.LiteShape2;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.locationtech.jts.geom.Geometry;
import org.opengis.feature.Property;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.MathTransform;
import org.opengis.referencing.operation.TransformException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.calculation.Operations;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.dto.ScenarioAreaDto;
import se.havochvatten.symphony.dto.ScenarioDto;
import se.havochvatten.symphony.entity.CalculationArea;
import se.havochvatten.symphony.entity.Scenario;
import se.havochvatten.symphony.entity.ScenarioArea;
import se.havochvatten.symphony.scenario.BandChange;
import se.havochvatten.symphony.scenario.BandChangeEntity;
import se.havochvatten.symphony.scenario.ScenarioCopyOptions;
import se.havochvatten.symphony.scenario.ScenarioSplitOptions;
import se.havochvatten.symphony.util.Util;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.media.jai.ROI;
import javax.media.jai.ROIShape;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;
import javax.ws.rs.ForbiddenException;
import javax.ws.rs.NotAuthorizedException;
import javax.ws.rs.NotFoundException;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Stateless
public class ScenarioService {
    private static final Logger LOG = LoggerFactory.getLogger(ScenarioService.class);
    private static final double MAX_IMPACT_VALUE = 100.0;

    private static final ObjectMapper mapper = new ObjectMapper();

    @PersistenceContext(unitName = "symphonyPU")
    private EntityManager em;

    private final Operations operations;

    public ScenarioService() {this.operations = null;}     // dummy constructor to satisfy CDI framework

    @Inject
    public ScenarioService(Operations operations) {
        this.operations = operations;
    }

    @EJB
    private CalculationAreaService calculationAreaService;

    public Scenario findById(int id) {
        return em.find(Scenario.class, id); // null if not found
    }

    public ScenarioArea findAreaById(int id) {
        return em.find(ScenarioArea.class, id);
    }

    public List<ScenarioDto> findAllByOwner(Principal principal) {
        try {
            return em.createNamedQuery("Scenario.findAllByOwner", ScenarioDto.class)
                .setParameter("owner", principal.getName())
                .getResultList().stream().filter(s -> s.id != null)
                .sorted(Comparator.<ScenarioDto>comparingInt(s -> s.id).reversed()).collect(Collectors.toList());
        } catch (Exception e) {
            return null;
        }
    }

    public Scenario create(Scenario scenario, Principal principal) {
        scenario.setOwner(principal.getName());

        em.persist(scenario);
        em.createNamedQuery("ScenarioAreas.setPolygon")
            .setParameter("scenarioId", scenario.getId())
            .executeUpdate();

        em.flush();

        return scenario;
    }

    public Scenario update(Scenario updated) {
        em.createNamedQuery("ScenarioAreas.setPolygon")
            .setParameter("scenarioId", updated.getId())
            .executeUpdate();

        return em.merge(updated);
    }

    @Transactional
    public ScenarioArea updateArea(ScenarioArea updated) {
        em.merge(updated);
        em.flush();
        return updated;
    }

    @Transactional
    public ScenarioArea updateArea(ScenarioArea updated, Integer calculationAreaId) {
        if(calculationAreaId != null) {
            CalculationArea calculationArea = calculationAreaService.findCalculationArea(calculationAreaId);
            updated.setCustomCalcArea(calculationArea);
        }

        em.createNamedQuery("ScenarioArea.setSinglePolygon")
            .setParameter("id", updated.getId())
            .executeUpdate();

        return updateArea(updated);
    }

    public void delete(Principal principal, int id) {
        var s = em.find(Scenario.class, id);

        if (s == null)
            throw new NotFoundException();
        if (!s.getOwner().equals(principal.getName()))
            throw new ForbiddenException(principal.getName());
        else
            em.remove(s);
    }

    /**
     * Calculate new input coverages based on scenario changes described by feature collection
     *
     * @return coverages with scenario changes applied
     * <p>
     * Take a continuation function and pass params to it instead of returning pair since Java lack
     * destructuring?
     **/
    public Pair<GridCoverage2D, GridCoverage2D> applyScenario(GridCoverage2D ecosystems,
                                                              GridCoverage2D pressures,
                                                              List<ScenarioArea> areas,
                                                              BandChangeEntity altScenario) throws FactoryException, TransformException {
        // We assume GeoJSON is in WGS84 and that ecosystem and pressures coverages are of the same CRS
        assert (ecosystems.getCoordinateReferenceSystem().equals(pressures.getCoordinateReferenceSystem()));
        MathTransform WGS84toTarget = CRS.findMathTransform(DefaultGeographicCRS.WGS84,
                ecosystems.getCoordinateReferenceSystem());

        return Pair.of(
                apply(ecosystems, ecosystems.getGridGeometry(), areas, LayerType.ECOSYSTEM, WGS84toTarget, altScenario),
                apply(pressures, pressures.getGridGeometry(), areas, LayerType.PRESSURE, WGS84toTarget, altScenario)
        );
    }

    /**
     * @return coverage containing scenario changes
     */
    public GridCoverage2D apply(GridCoverage2D coverage,
                                GridGeometry2D gridGeometry,
                                List<ScenarioArea> areas,
                                LayerType changeType,
                                MathTransform roiTransform,
                                BandChangeEntity alternateChangeSource)
            throws TransformException, FactoryException {
        final int numBands = coverage.getNumSampleDimensions();

        return Util.reduce(areas, coverage, (state, area) -> {
            try {
                // Reproject ROI to coverage CRS
                var areaGeometry = area.getGeometry();
                Geometry projectedROI = JTS.transform(areaGeometry, roiTransform);

                // Transform ROI to grid coordinates
                var gridROI = (ROI) new ROIShape(
                    new LiteShape2(projectedROI, gridGeometry.getCRSToGrid2D(), null, false));

                List<BandChange> bandChanges = Arrays.stream(area.getAllChangesByType(alternateChangeSource, changeType))
                    .collect(Collectors.toList());

                return Util.reduce(bandChanges, // iterate over band changes
                    state,
                    (GridCoverage2D innerState, BandChange bandChange) -> {
                        LOG.info("Applying changes for feature {}: " + bandChange,
                            area.getName());

                        var multipliers = new double[numBands];
                        Arrays.fill(multipliers, 1.0);  // default to no change
                        multipliers[bandChange.band] = bandChange.multiplier == null ? 1.0 : bandChange.multiplier;

                        var offsets = new double[numBands];
                        // No need to fill since array is initialized to zero by default
                        offsets[bandChange.band] = bandChange.offset == null ? 0.0 : bandChange.offset;

                        GridCoverage2D g2d = (GridCoverage2D) operations.rescale(innerState, multipliers, offsets,
                            gridROI, MAX_IMPACT_VALUE, changeType);

                        return g2d;
                    });
            } catch (TransformException | FactoryException e) {
                LOG.error("Error transforming change ROI: " + e);
                return state;
            }
        });
    }

    /**
     * @param type The type of change to extract
     */
    private List<BandChange> getBandChangesFromFeatureProperty(Property changeProperty, LayerType type) {
        Map<String, Object> changes = mapper.convertValue(changeProperty.getValue(),
                new TypeReference<Map<String, Object>>() {});

        return changes.entrySet().stream()
                .peek(entry -> LOG.debug("Parsing change " + entry.getKey()))
                .map(entry -> mapper.convertValue(entry.getValue(), BandChange.class))
                .filter(change -> change.type == type)
                .collect(Collectors.toUnmodifiableList());
    }

    public void deleteArea(Principal userPrincipal, int areaId) {
        ScenarioArea area = em.find(ScenarioArea.class, areaId);
        Scenario scenario = area.getScenario();

        if (area == null)
            throw new NotFoundException();
        if (!scenario.getOwner().equals(userPrincipal.getName()))
            throw new NotAuthorizedException(userPrincipal.getName());
        else
            scenario.getAreas().remove(area);
            em.remove(area);
            em.merge(scenario);

        if(scenario.getAreas().isEmpty())
            em.remove(scenario);
    }

    public ScenarioAreaDto[] addAreas(Scenario scenario, ScenarioAreaDto[] areaDtos) throws JsonProcessingException {
        ScenarioArea[] newAreas = new ScenarioArea[areaDtos.length];
        int i = 0;

        for (ScenarioAreaDto areaDto : areaDtos) {
            ScenarioArea area = new ScenarioArea(areaDto, scenario);
            em.persist(area);
            em.flush();
            newAreas[i++] = area;

            ArrayList<Object> statePath = (ArrayList<Object>) area.getFeature().getAttribute("statePath");

            // Areas from "split and replace" action won't have a statePath set
            if(statePath == null || statePath.isEmpty()) {
                SimpleFeature feature = area.getFeature();
                String serialName = "%s %d".formatted(feature.getAttribute("name"), i);
                statePath = new ArrayList<>();
                statePath.add("scenarioArea");
                statePath.add(area.getId());
                feature.setAttribute("statePath", statePath);
                feature.setAttribute("name", serialName);
                feature.setAttribute("displayName", serialName);
                feature.setAttribute("id", serialName);
                area.setFeature(mapper.readTree(toGeoJSON(feature)));
                em.merge(area);
            }
        }

        Scenario finalScenario = em.merge(scenario);

        em.createNamedQuery("ScenarioAreas.setPolygon")
            .setParameter("scenarioId", scenario.getId())
            .executeUpdate();

        return Arrays.stream(newAreas).map(
            scenarioArea -> new ScenarioAreaDto(scenarioArea, finalScenario.getId()))
            .toArray(ScenarioAreaDto[]::new);
    }

    public ScenarioDto copy(Scenario scenario, ScenarioCopyOptions options) {

        Scenario copiedScenario = new Scenario(scenario, options, null);
        em.persist(copiedScenario);
        em.flush();

        return new ScenarioDto(copiedScenario);
    }

    public Scenario transferChanges(BandChangeEntity target, BandChangeEntity source, boolean overwrite) {

        if(overwrite) {
            target.setChanges(source.getChanges());
        } else {
            var changes = target.getChangeMap();
            changes.putAll(source.getChangeMap());
            target.setChanges(mapper.valueToTree(changes));
        }

        if(target instanceof ScenarioArea) {
            var area = (ScenarioArea) target;
            var targetScenario = area.getScenario();
            targetScenario.getAreas().remove(area);
            targetScenario.getAreas().add(area);
            em.merge(targetScenario);
            em.flush();

            return targetScenario;
        } else {
            em.merge(target);
            em.flush();

            return (Scenario) target;
        }
    }

    @Transactional
    public int[] split(Scenario scenario, ScenarioSplitOptions options) {
        JsonNode commonChanges = scenario.getChanges();
        List<ScenarioArea> areas = scenario.getAreas();
        int[] newScenarioIds = new int[areas.size()];
        int aix = 0;

        for (ScenarioArea area : areas) {
            ScenarioCopyOptions copyOptions = new ScenarioCopyOptions(area, options);
            scenario.setChanges(options.applyAreaChanges() && !area.getChangeMap().isEmpty() ?
                mapper.valueToTree(area.getCombinedChangeMap()) : commonChanges);
            Scenario newScenario = new Scenario(scenario, copyOptions, List.of(area));
            em.persist(newScenario);
            newScenarioIds[aix++] = (em.merge(newScenario)).getId();
        }

        em.detach(scenario);
        em.flush();

        return newScenarioIds;
    }

    public Scenario splitAndReplaceArea(Scenario scenario, int scenarioAreaId, ScenarioAreaDto[] replacementAreas) {
        ScenarioArea area = scenario.getAreas().stream()
            .filter(a -> a.getId() == scenarioAreaId)
            .findFirst()
            .orElseThrow(NotFoundException::new);
        try {
            replacementAreas = addAreas(scenario, replacementAreas);

            scenario.setScenarioAreas(
                Stream.concat(
                    Arrays.stream(scenario.getAreas().toArray(new ScenarioArea[0]))
                        .filter(a -> a.getId() != scenarioAreaId),
                    Arrays.stream(replacementAreas).map(
                        areaDto -> em.find(ScenarioArea.class, areaDto.id))).collect(Collectors.toList())
            );

            em.merge(scenario);
            em.flush();
            return scenario;

        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public int[] getIncludedBands(int activeScenarioId, LayerType category) {
        return em.createNamedQuery(
                (category == LayerType.ECOSYSTEM ?
                    "Scenario.getEcosystemsToInclude" :
                    "Scenario.getPressuresToInclude"), int[].class)
            .setParameter("scenarioId", activeScenarioId)
            .getSingleResult();
    }

    public static String toGeoJSON(SimpleFeature f) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try(GeoJSONWriter gjWriter = new GeoJSONWriter(out)) {
            gjWriter.setSingleFeature(
                !((Geometry) f.getDefaultGeometry())
                    .getGeometryType().equals("MultiPolygon"));
            gjWriter.setMaxDecimals(7);
            gjWriter.write(f);
            return out.toString();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
