package se.havochvatten.symphony.calculation;

import com.fasterxml.jackson.databind.ObjectMapper;
import it.geosolutions.jaiext.utilities.ImageLayout2;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.GridEnvelope2D;
import org.geotools.coverage.grid.GridGeometry2D;
import org.geotools.coverage.grid.io.AbstractGridFormat;
import org.geotools.data.geojson.GeoJSONReader;
import org.geotools.gce.geotiff.GeoTiffFormat;
import org.geotools.gce.geotiff.GeoTiffWriteParams;
import org.geotools.gce.geotiff.GeoTiffWriter;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.JTSFactoryFinder;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.locationtech.jts.geom.Envelope;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.parameter.GeneralParameterValue;
import org.opengis.parameter.ParameterValueGroup;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.MathTransform;
import org.opengis.referencing.operation.TransformException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.calculation.jai.CIA.CumulativeImpactOp;
import se.havochvatten.symphony.dto.*;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.entity.CalculationResult;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.exception.SymphonyStandardSystemException;
import se.havochvatten.symphony.scenario.Scenario;
import se.havochvatten.symphony.scenario.ScenarioService;
import se.havochvatten.symphony.scenario.ScenarioSnapshot;
import se.havochvatten.symphony.service.BaselineVersionService;
import se.havochvatten.symphony.service.CalculationAreaService;
import se.havochvatten.symphony.service.DataLayerService;
import se.havochvatten.symphony.service.PropertiesService;
import se.havochvatten.symphony.util.Util;

import javax.annotation.PostConstruct;
import javax.ejb.*;
import javax.inject.Inject;
import javax.media.jai.ImageLayout;
import javax.media.jai.JAI;
import javax.media.jai.PlanarImage;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.servlet.http.HttpServletRequest;
import javax.transaction.*;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.security.Principal;
import java.util.*;
import java.util.List;
import java.util.function.DoublePredicate;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static se.havochvatten.symphony.dto.NormalizationType.PERCENTILE;

/**
 * Calculation service
 * <p>
 * In contrast to the JAI calculation operation this class is spatially aware.
 */
@Stateless // But some stuff is stored in user session!
@Startup
@TransactionManagement(TransactionManagementType.BEAN)
public class CalcService {
    private static final Logger LOG = LoggerFactory.getLogger(CalcService.class);

    /* Can be useful for debugging, but breaks persistent sessions since not serializable atm */
    static final boolean SAVE_MASK_IN_SESSION = false;

    private static final ObjectMapper mapper = new ObjectMapper(); // TODO Inject instead

    @PersistenceContext(unitName = "symphonyPU")
    public EntityManager em;

    @Inject
    private UserTransaction transaction;

    @EJB
    BaselineVersionService baselineVersionService;
    @EJB
    DataLayerService data;
    @EJB
    PropertiesService props;
    @EJB
    Operations operations;
    @EJB
    ScenarioService scenarioService;

    @Inject
    private CalculationAreaService calculationAreaService;

    @Inject
    private CalibrationService calibrationService;

    @PostConstruct
    void setup() {
        JAI jai = JAI.getDefaultInstance();
        var scheduler = jai.getTileScheduler();
        scheduler.setParallelism(Runtime.getRuntime().availableProcessors());
//                scheduler.setPrefetchParallelism(parallelism);

        var cache = jai.getTileCache();
//        cache.setMemoryThreshold(0.80f);
        int megabytesOfCache = Integer.parseInt(
                props.getProperty("calc.jai.tilecache.capacity", "1024"));
        cache.setMemoryCapacity(megabytesOfCache * 1024 * 1024L);
    }

    public List<CalculationResultSlice> getBaseLineCalculations(String baselineName) throws SymphonyStandardAppException {
        BaselineVersion baseline = baselineVersionService.getVersionByName(baselineName);

        return em.createNamedQuery("CalculationResult.findBaselineCalculationsByBaselineId", CalculationResultSlice.class).
                setParameter("id", baseline.getId()).
                getResultList();
    }

    public List<CalculationResultSlice> findAllByUser(String username) {
        return em.createNamedQuery("CalculationResult.findByOwner", CalculationResultSlice.class).
                setParameter("username", username).
                getResultList();
    }

    public List<CalculationResult> findAllFullByUser(Principal principal) {
        return em.createNamedQuery("CalculationResult.findFullByOwner", CalculationResult.class).
                setParameter("username", principal.getName()).
                getResultList();
    }

    public List<CalculationResultSlice> findAllMatchingGeometryByUser(
            Principal principal, CalculationResult base) {
        // Ideally we would do a spatial query to the database, but since areas are not stored as proper
        // PostGIS geometries this is not possible at it stands.
        var candidates = findAllFullByUser(principal);
        var baseFeature = base.getFeature();
        return candidates.stream()
                .filter(c -> !c.getId().equals(base.getId())) // omit the calculation whose matches we are
                // searching for
                .filter(c -> geometryEquals(baseFeature, c.getFeature()))
                .map(CalculationResultSlice::new)
                .collect(Collectors.toList());
    }

    /**
     * @return true if features are considered to have the same geometry
     */
    boolean geometryEquals(SimpleFeature a, SimpleFeature b) {
        // Better yet: Compare using feature id? (when GeoJSONReader actually returns them)
        var statePathA = a.getProperty("statePath");
        var statePathB = b.getProperty("statePath");
        if (statePathA != null && statePathB != null)
            return statePathA.getValue().equals(statePathB.getValue()); // Values are ArrayLists
        else // fall bock to geometry comparison
            return a.getDefaultGeometry().equals(b.getDefaultGeometry());
    }

    /**
     * Get full calculation object
     */
    public CalculationResult getCalculation(Integer id) {
        return em.find(CalculationResult.class, id);
    }

    public synchronized CalculationResult updateCalculation(CalculationResult calc) {
        try {
            transaction.begin();
            var result = em.merge(calc);
            transaction.commit();
            return result;
        } catch (Exception e) {
            throw new SymphonyStandardSystemException(SymphonyModelErrorCode.OTHER_ERROR, e, "CalculationResult " +
                "persistence error");
        } finally {
            try {
                if (transaction.getStatus() == Status.STATUS_ACTIVE)
                    transaction.rollback();
            } catch (Throwable e) {/* ignore */}
        }
    }

    byte[] writeGeoTiff(GridCoverage2D coverage) throws IOException {
        String type = props.getProperty("calc.result.compression.type");
        var quality = props.getProperty("calc.result.compression.quality");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            GeoTiffWriter writer = new GeoTiffWriter(baos);
            var wp = new GeoTiffWriteParams();

            if (type != null) {
                wp.setCompressionMode(GeoTiffWriteParams.MODE_EXPLICIT);
                wp.setCompressionType(type);
                if (quality != null)
                    wp.setCompressionQuality(Float.parseFloat(quality));
            }
            ParameterValueGroup pvg = writer.getFormat().getWriteParameters();
            pvg.parameter(
                            AbstractGridFormat.GEOTOOLS_WRITE_PARAMS.getName().toString())
                    .setValue(wp);
            pvg.parameter(GeoTiffFormat.WRITE_NODATA.getName().toString()).setValue(true);
            writer.write(coverage, pvg.values().toArray(new GeneralParameterValue[1]));
            writer.dispose();
        } catch (IOException e) {
            LOG.error("Error making result GeoTIFF: " + e);
            throw e;
        }
        return baos.toByteArray();
    }

    /**
     * @return union of polygons referenced by area matrices
     */
    private static Geometry getMatricesCombinedROI(List<AreaMatrixResponse> areaMatrices) {
        GeometryFactory factory = JTSFactoryFinder.getGeometryFactory();

        var collection = areaMatrices.
                stream().
                flatMap(areaMatrix -> areaMatrix.getPolygons().stream()).
                collect(Collectors.toList());

        // Warning: According to https://docs.geotools.org/latest/userguide.old/library/jts/combine.html
        // the below is very expensive if number of geometries increase beyond 5-10...
        return factory.buildGeometry(collection).union();
    }

    private static List<SensitivityMatrix> getUniqueMatrices(List<SensitivityMatrix> matrices) {
        return matrices.stream(). // filter in symphony-ws instead? (or use map!)
                filter(Util.distinctByKey(SensitivityMatrix::getMatrixId)).
                collect(Collectors.toList());
    }

    /**
     * Calculate an area
     *
     * @return coverage in input coordinate system (EPSG 3035 in the Swedish case)
     */
    public CalculationResult calculateScenarioImpact(HttpServletRequest req, Scenario scenario,
                                                     String operationName, Map<String, String> operationOptions)
            throws FactoryException, TransformException, IOException, SymphonyStandardAppException {
        MatrixResponse matrixResponse = calculationAreaService.getAreaCalcMatrices(scenario);

        BaselineVersion baseline = baselineVersionService.getBaselineVersionById(scenario.getBaselineId());
        // Cache these in a map?
        GridCoverage2D ecoComponents = data.getCoverage(LayerType.ECOSYSTEM, baseline.getId());
        GridCoverage2D pressures = data.getCoverage(LayerType.PRESSURE, baseline.getId());
        /* Superfluous reference for making clear that the coverage geometry does not depend on specifics in
        ecoComponents or pressures (which should be identical) */
        GridCoverage2D input = ecoComponents;

        MathTransform WGS84toTarget = CRS.findMathTransform(DefaultGeographicCRS.WGS84,
                input.getCoordinateReferenceSystem());

        // Apply scenario changes, if any
        if (scenario.getChanges() != null && !scenario.getChanges().isNull()) {
            var changeFeatures =
                    GeoJSONReader.parseFeatureCollection(mapper.writeValueAsString(scenario.getChanges()));
            if (!changeFeatures.isEmpty()) {
                var scenarioComponents = scenarioService.applyScenario(
                        ecoComponents,
                        pressures,
                        changeFeatures
                );
                ecoComponents = scenarioComponents.getLeft();
                pressures = scenarioComponents.getRight();
            }
        }

        Geometry minimalROI = getMatricesCombinedROI(matrixResponse.areaMatrixResponses);
        Geometry targetRoi = JTS.transform(minimalROI, WGS84toTarget); // Transform ROI to coverage CRS
        ReferencedEnvelope targetEnv = JTS.bounds(targetRoi, input.getCoordinateReferenceSystem());

        // The below is a more detailed transformation of ROI but it does not seem necessary:
        //        Envelope bb = JTS.bounds(roi, DefaultGeographicCRS.WGS84);
        //        org.locationtech.jts.geom.Envelope env = new ReferencedEnvelope(bb);
        //        var better = JTS.transform(env, null, WGS84toTarget, 1000);
        //        Envelope targetEnv = new ReferencedEnvelope(better, input.getCoordinateReferenceSystem2D());

        List<SensitivityMatrix> matrices = getUniqueMatrices(matrixResponse.sensitivityMatrices);
        // TODO: persist matrix ids in calculation

        // insert null element at start to correspond to mask background
        matrices.add(0, null); // do away with this hack and compensate on paint?

        GridGeometry2D gridGeometry = input.getGridGeometry();
        Envelope targetGridEnvelope = JTS.transform(targetEnv, gridGeometry.getCRSToGrid2D());

        ImageLayout layout = getImageLayout(targetGridEnvelope);

        var targetGridGeometry = getTargetGridGeometry(targetGridEnvelope, targetEnv);
        MatrixMask mask = new MatrixMask(targetGridGeometry.toCanonical(), layout,
                matrixResponse.areaMatrixResponses, CalcUtil.createMapFromMatrixIdToIndex(matrices));
        if (SAVE_MASK_IN_SESSION) {
            req.getSession().setAttribute("mask", mask.getAsPNG());
        }

//        Map<String, Object> props = new HashMap<>();
//        CoverageUtilities.setNoDataProperty(props, new NoDataContainer(CalcEngine.NO_DATA)); // TODO remove?

        var ecosystemsToInclude = scenario.getEcosystemsToInclude();
        GridCoverage2D coverage;
        if (operationName.equals("RarityAdjustedCumulativeImpact")) {
            final int[] tmpEcoSystems = ecosystemsToInclude;
            var domain = operationOptions.get("domain");
            var indices = switch (domain) {
                case "GLOBAL":
                    yield calibrationService.calculateGlobalCommonnessIndices(ecoComponents,
                        ecosystemsToInclude, scenario.getBaselineId());
                case "LOCAL":
                    var targetFeatureProjected = scenario.getFeature(); // N.B: Returns copy
                    targetFeatureProjected.setDefaultGeometry(targetRoi);
                    yield calibrationService.calculateLocalCommonnessIndices(ecoComponents,
                        ecosystemsToInclude, targetFeatureProjected);
                default:
                    throw new RuntimeException("Unknown rarity index calculation domain: "+domain);
            };

            // Filter out small layers that would cause division by zero, i.e. infinite impact.
            final var COMMONNESS_THRESHOLD = props.getPropertyAsDouble("calc.rarity_index.threshold", 0);
            DoublePredicate indexThresholdPredicate = (index) -> index > COMMONNESS_THRESHOLD;
            int[] ecosystemsToIncludeFiltered = IntStream.range(0, ecosystemsToInclude.length)
                .map(i -> {
                    var keep = indexThresholdPredicate.test(indices[i]);
                    if (!keep)
                        LOG.warn("Removing band {} since value is below or equal to commonness threshold {}", i,
                            COMMONNESS_THRESHOLD);
                    return keep ? tmpEcoSystems[i] : -1;
            }).filter(e -> e >= 0).toArray();

            ecosystemsToInclude = ecosystemsToIncludeFiltered;

            var nonZeroIndices = Arrays.stream(indices).filter(indexThresholdPredicate).toArray();
            // TODO report this information to the user and show in a dialog on frontend?

            coverage = operations.cumulativeImpact("RarityAdjustedCumulativeImpact",
                ecoComponents, pressures,
                ecosystemsToInclude, scenario.getPressuresToInclude(),
                preprocessMatrices(matrices), layout, mask, nonZeroIndices);
        } else
            coverage = operations.cumulativeImpact(operationName, ecoComponents, pressures,
                ecosystemsToInclude, scenario.getPressuresToInclude(), preprocessMatrices(matrices), layout, mask,
                null);

        // Trigger actual calculation since GeoTiffWriter requests tiles in the same thread otherwise
        var ignored = ((PlanarImage) coverage.getRenderedImage()).getTiles();

        CalculationResult calculation = scenario.getNormalization().type == PERCENTILE ?
            new CalculationResult(coverage) :
            persistCalculation(coverage, matrixResponse.normalizationValue,
                scenario, ecosystemsToInclude, operationName, operationOptions, baseline);

        // Cache last calculation in session to speed up subsequent REST call to retrieve result image
        req.getSession().setAttribute(CalcUtil.LAST_CALCULATION_PROPERTY_NAME, calculation);

        return calculation;
    }

    private GridGeometry2D getTargetGridGeometry(Envelope targetGridEnvelope, ReferencedEnvelope targetEnv) {
        return new GridGeometry2D( // FIXME reuse roiGridEnvelope?
                new GridEnvelope2D(/*roiGridEnvelope, PixelInCell.CELL_CENTER */
                        (int) targetGridEnvelope.getMinX(),
                        (int) targetGridEnvelope.getMinY(),
                        (int) targetGridEnvelope.getWidth(),
                        (int) targetGridEnvelope.getHeight()
                ),
                targetEnv
        );
    }

    private ImageLayout getImageLayout(Envelope envelope) {
        return new ImageLayout2(         // TODO be more precise with rounding stemming from integer cast?
                (int) envelope.getMinX(),
                (int) envelope.getMinY(),
                (int) envelope.getWidth(),
                (int) envelope.getHeight());
    }

    static double[][][] preprocessMatrices(List<SensitivityMatrix> sensitivityMatrices) {
        return sensitivityMatrices.stream().
                map(m -> m == null ? null : m.getMatrixValues()).
                toArray(double[][][]::new);
    }

    public CalculationResult persistCalculation(GridCoverage2D result,
                                                double normalizationValue,
                                                Scenario scenario,
                                                int[] ecosystemsThatWasIncluded,
                                                String operation,
                                                Map<String, String> operationOptions,
                                                BaselineVersion baselineVersion)
        throws IOException {
        var calculation = new CalculationResult(result);

        // TODO: Fill out some relevant TIFF metadata (such as Creator and NODATA)
        byte[] tiff = writeGeoTiff(result);      // N.B: raw result data, not normalized nor color-mapped

        synchronized (this) {
            try {
                transaction.begin();

                var snapshot = ScenarioSnapshot.makeSnapshot(scenario);
                snapshot.setEcosystemsToInclude(ecosystemsThatWasIncluded); // Override actually used only in snapshot
                em.persist(snapshot);
                calculation.setScenarioSnapshot(snapshot);

                calculation.setRasterData(tiff);
                calculation.setOwner(scenario.getOwner());
                calculation.setCalculationName(makeCalculationName(scenario));
                calculation.setNormalizationValue(normalizationValue);
                calculation.setTimestamp(new Date());
                var impactMatrix = (double[][]) result.getProperty(CumulativeImpactOp.IMPACT_MATRIX_PROPERTY_NAME);
                calculation.setImpactMatrix(impactMatrix);
                calculation.setBaselineVersion(baselineVersion);
                calculation.setOperationName(operation);
                calculation.setOperationOptions(operationOptions);

                em.persist(calculation);
                em.flush(); // to have id generated

                scenario.setLatestCalculation(calculation);
                em.merge(scenario); // N.B: Will also persist any changes user has made to scenario since last save

                transaction.commit();
            } catch (Exception e) {
                throw new SymphonyStandardSystemException(SymphonyModelErrorCode.OTHER_ERROR, e,
                    "Error persisting calculation "+calculation);
            } finally {
                try {
                    if (transaction.getStatus() == Status.STATUS_ACTIVE)
                        transaction.rollback();
                } catch (Throwable e) {/* ignore */}
            }
        }

        // Optionally save to disk (for debugging)
        String resultsDir = props.getProperty("results.geotiff.dir");
        if (resultsDir != null) {
            var dir = new File(resultsDir);
            if (!dir.exists()) {
                var ignored = dir.mkdirs();
            }

            String filename = calculation.getId() + ".tiff";
            File file = dir.toPath().resolve(filename).toFile(); //.of(dir.toString, filename).toFile();
            try (FileOutputStream stream = new FileOutputStream(file)) {
                stream.write(tiff);
            } catch (IOException e) {
                LOG.warn("Error writing result GeoTIFF to disk: " + e);
            }
        }
        return calculation;
    }

    String makeCalculationName(Scenario scenario) {
        var previousCalc = scenario.getLatestCalculation();
        if (previousCalc == null)
            return scenario.getName();
        else {
            var matcher = Pattern.compile(".*(\\d+)").matcher(previousCalc.getCalculationName());
            var lastSequenceNumber = matcher.find() ? Integer.parseInt(matcher.group(1)) : 1;
            var previousCalculations = findAllByUser(scenario.getOwner());
            return findSequentialUniqueName(scenario.getName(),
                    previousCalculations.stream().map(CalculationResultSlice::getName).collect(Collectors.toList()),
                    lastSequenceNumber);
        }
    }

    String findSequentialUniqueName(String scenarioName, List<String> previousNames, int counter) {
        var tentativeName = makeNumberedCalculationName(scenarioName, counter);
        if (!previousNames.contains(tentativeName))
            return tentativeName;
        else
            return findSequentialUniqueName(scenarioName, previousNames, counter+1);
    }

    private String makeNumberedCalculationName(String name, int n) {
        return String.format(name + " (%d)", n);
    }

    /**
     * Compute (scenario-base)/base = div(sub(b,a), a)
     */
    public GridCoverage2D relativeDifference(GridCoverage2D base, GridCoverage2D scenario) {
        var difference = operations.subtract(scenario, base);
        // Do dummy add operation to promote base (denominator) image to float
        // TODO: Add promote operation?
        var floatbase = operations.add(base, new double[]{0.0});
        return (GridCoverage2D) operations.divide(difference, floatbase);
    }
}

