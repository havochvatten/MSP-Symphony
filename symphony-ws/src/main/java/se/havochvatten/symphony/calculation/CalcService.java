package se.havochvatten.symphony.calculation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import it.geosolutions.jaiext.utilities.ImageLayout2;
import org.apache.commons.lang3.tuple.MutablePair;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.GridEnvelope2D;
import org.geotools.coverage.grid.GridGeometry2D;
import org.geotools.coverage.grid.io.AbstractGridFormat;
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
import se.havochvatten.symphony.dto.SensitivityMatrix;
import se.havochvatten.symphony.entity.*;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.exception.SymphonyStandardSystemException;
import se.havochvatten.symphony.scenario.*;
import se.havochvatten.symphony.service.BaselineVersionService;
import se.havochvatten.symphony.service.CalculationAreaService;
import se.havochvatten.symphony.service.DataLayerService;
import se.havochvatten.symphony.service.PropertiesService;

import javax.annotation.PostConstruct;
import javax.batch.operations.JobOperator;
import javax.batch.operations.NoSuchJobExecutionException;
import javax.batch.runtime.BatchRuntime;
import javax.batch.runtime.JobExecution;
import javax.ejb.*;
import javax.inject.Inject;
import javax.media.jai.ImageLayout;
import javax.media.jai.JAI;
import javax.media.jai.PlanarImage;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.*;
import javax.ws.rs.NotAuthorizedException;
import javax.ws.rs.NotFoundException;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.security.Principal;
import java.util.*;
import java.util.List;
import java.util.concurrent.TimeUnit;
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
    public static final int OPERATION_CUMULATIVE = 0;
    public static final int OPERATION_RARITYADJUSTED = 1;
    private static final Logger LOG = LoggerFactory.getLogger(CalcService.class);

    public static String operationName(int operation) {
    // Temporary solution.
    // Should utilize enum (?) but due to inadequacies re: Hibernate mapping of
    // postgres enum data type (availalble for pgdb > v10) int is chosen instead.
    // Operation options json object is also arguably suboptimal, but kept as
    // legacy. There may be a case for a more thorough restructuring.

     return operation == CalcService.OPERATION_CUMULATIVE ?
        "CumulativeImpact" :
        "RarityAdjustedCumulativeImpact";
    }

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

    private record ScenarioChanges (Map<String, BandChange> baseChanges, Map<Integer, Map<String, BandChange>> areaChanges ) {}

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

    public List<CalculationResultSlice> findAllCmpByUser(Principal principal, int operation) {
        return em.createNamedQuery("CalculationResult.findCmpByOwner", CalculationResultSlice.class).
                setParameter("username", principal.getName()).
                setParameter("operation", operationName(operation)).
                getResultList();
    }

    public List<CalculationResultSlice> findAllMatchingGeometryByUser(
            Principal principal, CalculationResult base) {
        // Ideally we would do a spatial query to the database, but since areas are not stored as proper
        // PostGIS geometries this is not possible at it stands.

        Geometry baseGeometry = base.getScenarioSnapshot().getGeometry();
        // Somewhat strange indirection here for stringency, should be refactored as an enum
        int operation = base.getOperationName().equals("CumulativeImpact") ?
                OPERATION_CUMULATIVE : OPERATION_RARITYADJUSTED;

        var candidates = findAllCmpByUser(principal, operation);

        return candidates.stream()
                .filter(c -> !base.getId().equals(c.id)) // omit the calculation whose matches we are
                // searching for
                .filter(c -> baseGeometry.equals(c.getGeometry()))
                .toList();
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

    private BatchCalculation getBatchCalculationStatus(Integer id) {
        return em.find(BatchCalculation.class, id);
    }

    public BatchCalculation getBatchCalculationStatusAuthorized(Principal userPrincipal, Integer id)
        throws NotFoundException, NotAuthorizedException {
        BatchCalculation batchCalculation = getBatchCalculationStatus(id);

        if (batchCalculation == null)
            throw new NotFoundException();
        if (!batchCalculation.getOwner().equals(userPrincipal.getName()))
            throw new NotAuthorizedException(userPrincipal.getName());

        return batchCalculation;
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

    public synchronized void delete(Principal principal, Object entity) {
        try {
            transaction.begin();
            em.remove(em.merge(entity));
            transaction.commit();
        } catch (Exception e) {
            throw new SymphonyStandardSystemException(SymphonyModelErrorCode.OTHER_ERROR, e,
                    entity.getClass().getSimpleName() + " persistence error");
        } finally {
            try {
                if (transaction.getStatus() == Status.STATUS_ACTIVE)
                    transaction.rollback();
            } catch (Throwable e) {/* ignore */}
        }

    }

    public synchronized void delete(Principal principal, int id) {
        var calc = getCalculation(id);

        if (calc == null)
            throw new NotFoundException();
        if (!calc.getOwner().equals(principal.getName()))
            throw new NotAuthorizedException(principal.getName());
        else {
            delete(principal, calc);
        }
    }

    public byte[] writeGeoTiff(GridCoverage2D coverage) throws IOException {
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

    private List<SensitivityMatrix> getUniqueMatrices(MatrixResponse matrixResponse, Integer baselineId) {
        List<Integer> matrixIds = matrixResponse.areaMatrixMap.values().stream().map(MutablePair::getLeft).distinct().toList();
        List<SensitivityMatrix> smList = matrixIds.stream().map(matrixId ->
        {
            try {
                return new SensitivityMatrix(matrixId, calculationAreaService.getSensitivityMatrix(matrixId, baselineId));
            } catch (SymphonyStandardAppException e) {
                throw new RuntimeException(e);
            }
        }).toList();

        return new ArrayList<>(smList);
    }

    private Geometry coastalComplement(Scenario scenario) throws SymphonyStandardAppException {

        Geometry scenarioGeometry = scenario.getGeometry();
        Geometry excludedCoastPolygon = null;
        Map<Integer, Integer> areasExcludingCoastal = scenario.getAreasExcludingCoastal();

        if(areasExcludingCoastal.isEmpty()) {
            return scenarioGeometry;
        } else {
            List<Integer> excludedAreaIds = areasExcludingCoastal.values().stream().toList();
            List<CalculationArea> caList = calculationAreaService.findCalculationAreas(excludedAreaIds);

            if(caList.isEmpty()){
                return scenarioGeometry;
            }

            Map<Integer, List<CaPolygon>> polygonCache;
            polygonCache = caList.stream().collect(Collectors.toMap(CalculationArea::getId, CalculationArea::getCaPolygonList));

            for (var areaId : areasExcludingCoastal.keySet()) {
                var caPolygons = polygonCache.get(areasExcludingCoastal.get(areaId));
                for(var caPoly : caPolygons){
                    Geometry caGeo = CalculationAreaService.jsonToGeometry(caPoly.getPolygon());
                    if(caGeo != null) {
                        if (excludedCoastPolygon == null) {
                            excludedCoastPolygon = caGeo;
                        } else {
                            excludedCoastPolygon = excludedCoastPolygon.union(caGeo);
                        }
                    }
                }
            }
            return scenarioGeometry.difference(excludedCoastPolygon);
        }
    }

    /**
     * Calculate an area
     *
     * @return coverage in input coordinate system (EPSG 3035 in the Swedish case)
     */
    public CalculationResult calculateScenarioImpact(Scenario scenario)
            throws FactoryException, TransformException, IOException, SymphonyStandardAppException {

        Geometry roi = coastalComplement(scenario);
        MatrixResponse matrixResponse = calculationAreaService.getAreaCalcMatrices(scenario);
        List<ScenarioArea> areas = scenario.getAreas();

        areas.sort(Comparator.comparing(ScenarioArea::getId));

        BaselineVersion baseline = baselineVersionService.getBaselineVersionById(scenario.getBaselineId());
        // Cache these in a map?
        GridCoverage2D ecoComponents = data.getCoverage(LayerType.ECOSYSTEM, baseline.getId());
        GridCoverage2D pressures = data.getCoverage(LayerType.PRESSURE, baseline.getId());
        /* Superfluous reference for making clear that the coverage geometry does not depend on specifics in
        ecoComponents or pressures (which should be identical) */
        GridCoverage2D input = ecoComponents;

        MathTransform WGS84toTarget = CRS.findMathTransform(DefaultGeographicCRS.WGS84,
                input.getCoordinateReferenceSystem());

        var scenarioComponents = scenarioService.applyScenario(
            ecoComponents,
            pressures,
            scenario
        );

        ecoComponents = scenarioComponents.getLeft();
        pressures = scenarioComponents.getRight();

//        Geometry minimalROI = getMatricesCombinedROI(matrixResponse.areaMatrixResponses);
        Geometry targetRoi = JTS.transform(roi, WGS84toTarget); // Transform ROI to coverage CRS
        ReferencedEnvelope targetEnv = JTS.bounds(targetRoi, input.getCoordinateReferenceSystem());

        // The below is a more detailed transformation of ROI but it does not seem necessary:
        //        Envelope bb = JTS.bounds(roi, DefaultGeographicCRS.WGS84);
        //        org.locationtech.jts.geom.Envelope env = new ReferencedEnvelope(bb);
        //        var better = JTS.transform(env, null, WGS84toTarget, 1000);
        //        Envelope targetEnv = new ReferencedEnvelope(better, input.getCoordinateReferenceSystem2D());

        List<SensitivityMatrix> matrices = getUniqueMatrices(matrixResponse, scenario.getBaselineId());
        // TODO: persist matrix ids in calculation

        // insert null element at start to correspond to mask background
        matrices.add(0, null); // do away with this hack and compensate on paint?
        matrixResponse.areaMatrixMap.put(0, null);
        GridGeometry2D gridGeometry = input.getGridGeometry();
        Envelope targetGridEnvelope = JTS.transform(targetEnv, gridGeometry.getCRSToGrid2D());

        ImageLayout layout = getImageLayout(targetGridEnvelope);

        var targetGridGeometry = getTargetGridGeometry(targetGridEnvelope, targetEnv);
        MatrixMask mask = new MatrixMask(targetGridGeometry.toCanonical(), layout,
                matrixResponse, scenario.getAreas(), CalcUtil.createMapFromMatrixIdToIndex(matrices));

        var ecosystemsToInclude = scenario.getEcosystemsToInclude();
        GridCoverage2D coverage;
        if (scenario.getOperation() == CalcService.OPERATION_RARITYADJUSTED) {
            // Refactor this. Enum is explicitly avoided.
            final int[] tmpEcoSystems = ecosystemsToInclude;
            var domain = scenario.getOperationOptions() != null ?
                scenario.getOperationOptions().get("domain") : "GLOBAL";
            var indices = switch (domain) {
                case "GLOBAL":
                    yield calibrationService.calculateGlobalCommonnessIndices(ecoComponents,
                        ecosystemsToInclude, scenario.getBaselineId());
                case "LOCAL":
                    yield calibrationService.calculateLocalCommonnessIndices(ecoComponents,
                        ecosystemsToInclude, scenario.compileZones());
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
            coverage = operations.cumulativeImpact(
                CalcService.operationName(scenario.getOperation()),
                ecoComponents,
                pressures,
                ecosystemsToInclude, scenario.getPressuresToInclude(), preprocessMatrices(matrices), layout, mask,
                null);

        // Trigger actual calculation since GeoTiffWriter requests tiles in the same thread otherwise
        var ignored = ((PlanarImage) coverage.getRenderedImage()).getTiles();

        ScenarioChanges sc = new ScenarioChanges(scenario.getChangeMap(), new HashMap<>());

        // Importantly, areas list is sorted numerically by id
        double[] normalizationValues = new double[areas.size()];
        Map<Integer, Integer> areaMatrices = new HashMap<>();
        int a_ix = 0, a_id;

        for(ScenarioArea area : scenario.getAreas()) {
            a_id = area.getId();
            normalizationValues[a_ix] = matrixResponse.getAreaNormalizationValue(a_id);
            areaMatrices.put(a_id, matrixResponse.getAreaMatrixId(a_id));
            sc.areaChanges.put(a_id, area.getChangeMap());
            ++a_ix;
        }

        CalculationResult calculation = scenario.getNormalization().type == PERCENTILE ?
            new CalculationResult(coverage) :
            persistCalculation( coverage, normalizationValues, areaMatrices, scenario,
                                mapper.valueToTree(sc), ecosystemsToInclude, baseline, targetRoi);

        // previous approach for caching calculation results in session, apparently not reliable
        // Cache last calculation in session to speed up subsequent REST call to retrieve result image
        //req.getSession().setAttribute(CalcUtil.LAST_CALCULATION_PROPERTY_NAME, calculation);

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

    @Transactional
    public BatchCalculation queueBatchCalculation(int[] idArray, String owner) {
        BatchCalculation batchCalculation = new BatchCalculation();
        batchCalculation.setScenarios(idArray);
        batchCalculation.setOwner(owner);

        em.persist(batchCalculation);
        em.flush();

        JobOperator jobOperator = BatchRuntime.getJobOperator();
        Properties jobParameters = new Properties();

        jobParameters.setProperty("batchCalculationId", String.valueOf(batchCalculation.getId()));

        long executionId = jobOperator.start("calculateBatch", jobParameters);
        batchCalculation.setExecutionId((int) executionId);
        em.merge(batchCalculation);

        return batchCalculation;
    }

    public void cancelBatchCalculation(Principal userPrincipal, int id)
        throws NotFoundException, NotAuthorizedException, SymphonyStandardAppException {

        BatchCalculation batchCalculation = getBatchCalculationStatusAuthorized(userPrincipal, id);

        if(isBatchCalculationRunning(batchCalculation.getExecutionId())) {
            JobOperator jobOperator = BatchRuntime.getJobOperator();
            jobOperator.stop(batchCalculation.getExecutionId());
        }
    }

    public void deleteBatchCalculationEntry(Principal userPrincipal, int id)
        throws SymphonyStandardAppException, NotFoundException, NotAuthorizedException {
        BatchCalculation batchCalculation = getBatchCalculationStatusAuthorized(userPrincipal, id);

        if(isBatchCalculationRunning(batchCalculation.getExecutionId()))
            throw new SymphonyStandardAppException(
                SymphonyModelErrorCode.BATCH_CALCULATION_JOB_RUNNING,
                SymphonyModelErrorCode.BATCH_CALCULATION_JOB_RUNNING.getErrorMessage());
        else {
            delete(userPrincipal, batchCalculation);
        }
    }

    public boolean isBatchCalculationRunning(int executionId) {
        JobOperator jobOperator = BatchRuntime.getJobOperator();
        JobExecution execution;

        try {
            execution = jobOperator.getJobExecution(executionId);
        } catch (NoSuchJobExecutionException e) {
            return false;
        }

        return execution.getBatchStatus() == javax.batch.runtime.BatchStatus.STARTED;
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
                                                double[] normalizationValue,
                                                Map<Integer, Integer> areaMatrixMap,
                                                Scenario scenario,
                                                JsonNode changesSnapshot,
                                                int[] includedEcosystems,
                                                BaselineVersion baselineVersion,
                                                Geometry projectedRoi)
        throws IOException {
        var calculation = new CalculationResult(result);

        // TODO: Fill out some relevant TIFF metadata (such as Creator and NODATA)
        byte[] tiff = writeGeoTiff(result);      // N.B: raw result data, not normalized nor color-mapped

        synchronized (this) {
            try {
                transaction.begin();

                var snapshot = ScenarioSnapshot.makeSnapshot(scenario, projectedRoi);
                snapshot.setEcosystemsToInclude(includedEcosystems); // Override actually used only in snapshot
                snapshot.setChanges(changesSnapshot);
                em.persist(snapshot);
                calculation.setScenarioSnapshot(snapshot);

                calculation.setRasterData(tiff);
                calculation.setOwner(scenario.getOwner());
                calculation.setCalculationName(makeCalculationName(scenario));
                calculation.setNormalizationValue(normalizationValue);
                calculation.setAreaMatrixMap(areaMatrixMap);
                calculation.setTimestamp(new Date());
                var impactMatrix = (double[][]) result.getProperty(CumulativeImpactOp.IMPACT_MATRIX_PROPERTY_NAME);
                calculation.setImpactMatrix(impactMatrix);
                calculation.setBaselineVersion(baselineVersion);
                calculation.setOperationName(scenario.getOperation());
                calculation.setOperationOptions(scenario.getOperationOptions());

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

