package se.havochvatten.symphony.scenario;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.tuple.Pair;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.GridGeometry2D;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.LiteShape2;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.geotools.util.factory.Hints;
import org.locationtech.jts.geom.Geometry;
import org.opengis.feature.Feature;
import org.opengis.feature.Property;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.MathTransform;
import org.opengis.referencing.operation.TransformException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.calculation.CalcUtil;
import se.havochvatten.symphony.calculation.SymphonyCoverageProcessor;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.dto.ScenarioDto;
import se.havochvatten.symphony.util.Util;

import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.media.jai.ImageLayout;
import javax.media.jai.JAI;
import javax.media.jai.ROI;
import javax.media.jai.ROIShape;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.ws.rs.NotAuthorizedException;
import javax.ws.rs.NotFoundException;
import java.awt.image.DataBuffer;
import java.security.Principal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.stream.Collectors;

@Stateless
public class ScenarioService {
    private static final Logger LOG = LoggerFactory.getLogger(ScenarioService.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    private static final double MAX_IMPACT_VALUE = 100.0;

    @PersistenceContext(unitName = "symphonyPU")
    private EntityManager em;

    private final SymphonyCoverageProcessor processor;

    // dummy constructor to satisfy CDI framework
    public ScenarioService() {this.processor = null;}

    @Inject
    public ScenarioService(SymphonyCoverageProcessor processor) {
        this.processor = processor;
    }

    public Scenario findById(int id) {
        return em.find(Scenario.class, id); // null if not found
    }

    public List<ScenarioDto> findAllByOwner(Principal principal) {
        return em.createNamedQuery("Scenario.findAllByOwner", ScenarioDto.class)
                .setParameter("owner", principal.getName())
                .getResultList();
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
                                                              FeatureCollection changes) throws FactoryException {
        // We assume GeoJSON is in WGS84 and that ecosystem and pressures coverages are of the same CRS
        assert (ecosystems.getCoordinateReferenceSystem().equals(pressures.getCoordinateReferenceSystem()));
        MathTransform WGS84toTarget = CRS.findMathTransform(DefaultGeographicCRS.WGS84,
                ecosystems.getCoordinateReferenceSystem());

        return Pair.of(
                apply(ecosystems, ecosystems.getGridGeometry(), changes, LayerType.ECOSYSTEM, WGS84toTarget),
                apply(pressures, pressures.getGridGeometry(), changes, LayerType.PRESSURE, WGS84toTarget)
        );
    }

    /**
     * @return coverage containing scenario changes
     */
    GridCoverage2D apply(GridCoverage2D coverage,
                         GridGeometry2D gridGeometry,
                         FeatureCollection scenarioChanges,
                         LayerType changeType,
                         MathTransform roiTransform) {
        final int numBands = coverage.getNumSampleDimensions();

        /*
         *  It would be more efficient (and more work to implement) to create a scenario mask containing all
         *  changes which could be applied in one go. Or perhaps make use of parallel stream.reduce.
         */
        return reduceFeatures(scenarioChanges.features(), // iterate over features
                coverage,
                (GridCoverage2D state, Feature changeFeature) -> {
                    try {
                        // Reproject ROI to coverage CRS
                        var featureGeometry =
                                (Geometry) changeFeature.getDefaultGeometryProperty().getValue();
                        Geometry projectedROI = JTS.transform(featureGeometry, roiTransform);

                        // Transform ROI to grid coordinates
                        var gridROI = (ROI) new ROIShape(
                                new LiteShape2(projectedROI, gridGeometry.getCRSToGrid2D(), null, false));

                        var bandChanges = getBandChangesFromFeatureProperty(
                                changeFeature.getProperty("changes"), changeType);
                        return Util.reduce(bandChanges, // iterate over band changes
                                state,
                                (GridCoverage2D innerState, BandChange bandChange) -> {
                                    LOG.info("Applying changes for feature {}: " + bandChange,
                                            changeFeature.getProperty("title").getValue().toString());

                                    var multipliers = new double[numBands];
                                    Arrays.fill(multipliers, 1.0);  // default to no change
                                    multipliers[bandChange.band] = bandChange.multiplier;

                                    var offsets = new double[numBands];
                                    // No need to fill since array is initialized to zero by default
                                    offsets[bandChange.band] = bandChange.offset;

                                    return rescaleCoverage(innerState, multipliers, offsets, gridROI);
                                });
                    } catch (TransformException | FactoryException e) {
                        LOG.error("Error transforming change ROI: " + e);
                        return state;
                    }
                }
        );
    }

    GridCoverage2D rescaleCoverage(GridCoverage2D source, double[] constants, double[] offsets,
                                          ROI roi) {
        // Pass in ImageLayout?
        final var rescale = processor.getOperation("se.havochvatten.symphony.Rescale");

        var params = rescale.getParameters();
        params.parameter("Source").setValue(source);
        params.parameter("constants").setValue(constants);
        params.parameter("offsets").setValue(offsets);
        params.parameter("ROI").setValue(roi);
        params.parameter("clamp").setValue(MAX_IMPACT_VALUE);

        return (GridCoverage2D) processor.doOperation(params);
    }


    private static <U> U reduceFeatures(FeatureIterator iter, U identity,
                                        BiFunction<U, Feature, U> accumulator) {
        U result = identity;
        try (FeatureIterator fs = iter) {
            while (fs.hasNext())
                result = accumulator.apply(result, fs.next());
        }
        return result;
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
}
