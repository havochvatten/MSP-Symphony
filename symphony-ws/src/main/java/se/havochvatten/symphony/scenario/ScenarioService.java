package se.havochvatten.symphony.scenario;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.tuple.Pair;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.GridGeometry2D;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.LiteShape2;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.locationtech.jts.geom.Geometry;
import org.opengis.feature.Property;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.MathTransform;
import org.opengis.referencing.operation.TransformException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.calculation.Operations;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.dto.ScenarioDto;
import se.havochvatten.symphony.service.CalculationAreaService;
import se.havochvatten.symphony.util.Util;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.media.jai.ROI;
import javax.media.jai.ROIShape;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;
import javax.ws.rs.NotAuthorizedException;
import javax.ws.rs.NotFoundException;
import java.security.Principal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
                .getResultList().stream().filter(s -> s.id != null).collect(Collectors.toList());
        } catch (Exception e) {
            return null;
        }
    }

    public Scenario create(Scenario scenario, Principal principal) {
        scenario.setOwner(principal.getName());

        em.persist(scenario);
        em.flush();

        return scenario;
    }

    public Scenario update(Scenario updated) {
        return em.merge(updated);
    }

    @Transactional
    public ScenarioArea updateArea(ScenarioArea updated) {
        em.merge(updated);
        em.flush();
        return updated;
    }

    public void delete(Principal principal, int id) {
        var s = em.find(Scenario.class, id);

        if (s == null)
            throw new NotFoundException();
        if (s == null || !s.getOwner().equals(principal.getName()))
            throw new NotAuthorizedException(principal.getName());
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
                                                              Scenario scenario) throws FactoryException, TransformException {
        // We assume GeoJSON is in WGS84 and that ecosystem and pressures coverages are of the same CRS
        assert (ecosystems.getCoordinateReferenceSystem().equals(pressures.getCoordinateReferenceSystem()));
        MathTransform WGS84toTarget = CRS.findMathTransform(DefaultGeographicCRS.WGS84,
                ecosystems.getCoordinateReferenceSystem());

        return Pair.of(
                apply(ecosystems, ecosystems.getGridGeometry(), scenario, LayerType.ECOSYSTEM, WGS84toTarget),
                apply(pressures, pressures.getGridGeometry(), scenario, LayerType.PRESSURE, WGS84toTarget)
        );
    }

    /**
     * @return coverage containing scenario changes
     */
    GridCoverage2D apply(GridCoverage2D coverage,
               GridGeometry2D gridGeometry,
               Scenario scenario,
               LayerType changeType,
               MathTransform roiTransform) {
        final int numBands = coverage.getNumSampleDimensions();

        return Util.reduce(scenario.getAreas(), coverage, (state, area) -> {
            try {
                // Reproject ROI to coverage CRS
                var areaGeometry = area.getGeometry();
                Geometry projectedROI = JTS.transform(areaGeometry, roiTransform);

                // Transform ROI to grid coordinates
                var gridROI = (ROI) new ROIShape(
                    new LiteShape2(projectedROI, gridGeometry.getCRSToGrid2D(), null, false));

                List<BandChange> bandChanges = Arrays.stream(area.getAllChanges())
                    .filter(c -> c.type == changeType)
                    .collect(Collectors.toList());

                return Util.reduce(bandChanges, // iterate over band changes
                    state,
                    (GridCoverage2D innerState, BandChange bandChange) -> {
                        LOG.info("Applying changes for feature {}: " + bandChange,
                            area.getFeature().getProperty("name").getValue().toString());

                        var multipliers = new double[numBands];
                        Arrays.fill(multipliers, 1.0);  // default to no change
                        multipliers[bandChange.band] = bandChange.multiplier;

                        var offsets = new double[numBands];
                        // No need to fill since array is initialized to zero by default
                        offsets[bandChange.band] = bandChange.offset;

                        return (GridCoverage2D) operations.rescale(innerState, multipliers, offsets,
                            gridROI, MAX_IMPACT_VALUE);
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
}
