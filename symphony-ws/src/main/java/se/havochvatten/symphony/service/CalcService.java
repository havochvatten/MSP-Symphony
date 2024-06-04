package se.havochvatten.symphony.service;

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
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.locationtech.jts.geom.Envelope;
import org.locationtech.jts.geom.Geometry;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.parameter.GeneralParameterValue;
import org.opengis.parameter.ParameterValueGroup;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.MathTransform;
import org.opengis.referencing.operation.TransformException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.calculation.*;
import se.havochvatten.symphony.calculation.jai.CIA.CumulativeImpactOp;
import se.havochvatten.symphony.dto.*;
import se.havochvatten.symphony.dto.SensitivityMatrix;
import se.havochvatten.symphony.entity.*;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.exception.SymphonyStandardSystemException;
import se.havochvatten.symphony.scenario.*;

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
import java.awt.image.Raster;
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

    @Inject
    ReportService reportService;

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

    public List<CalculationResultSliceDto> getBaseLineCalculations(String baselineName) throws SymphonyStandardAppException {
        BaselineVersion baseline = baselineVersionService.getVersionByName(baselineName);

        return em.createNamedQuery("CalculationResult.findBaselineCalculationsByBaselineId", CalculationResultSliceDto.class).
                setParameter("id", baseline.getId()).
                getResultList();
    }

    public List<CalculationResultSlice> findAllByUser(Principal user) {
        return findAllByUsername(user.getName());
    }

    private List<CalculationResultSlice> findAllByUsername(String username) {
        return em.createNamedQuery("CalculationResultSlice.findAllByOwner", CalculationResultSlice.class).
                setParameter("owner", username).
                getResultList();
    }

    public List<CalculationResultSliceDto> findAllCmpByUser(Principal user, int operation) {
        return em.createNamedQuery("CalculationResult.findCmpByOwner", CalculationResultSliceDto.class).
                setParameter("username", user.getName()).
                setParameter("operation", operationName(operation)).
                getResultList();
    }

    public List<CalculationResultSliceDto> findAllMatchingCalculationsByUser (
            Principal user, CalculationResult base) {
        // Ideally we would do a spatial query to the database, but since areas are not stored as proper
        // PostGIS geometries this is not possible at it stands.

        Geometry baseGeometry = base.getScenarioSnapshot().getGeometry();
        // Somewhat strange indirection here for stringency, should be refactored as an enum
        int operation = base.getOperationName().equals("CumulativeImpact") ?
                OPERATION_CUMULATIVE : OPERATION_RARITYADJUSTED;

        var candidates = findAllCmpByUser(user, operation);
        List<Integer> ecoList       = Arrays.stream(base.getScenarioSnapshot().getEcosystemsToInclude()).boxed().toList(),
                      pressureList  = Arrays.stream(base.getScenarioSnapshot().getPressuresToInclude()).boxed().toList();

        return candidates.stream()
                .filter(c -> !base.getId().equals(c.id)) // omit the calculation whose matches we are
                                                         // searching for
                .filter(c -> ecoList.size() == c.ecosystemsToInclude.size() &&
                             ecoList.containsAll(c.ecosystemsToInclude))
                .filter(c -> pressureList.size() == c.pressuresToInclude.size() &&
                             pressureList.containsAll(c.pressuresToInclude))
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

    public CalculationResultSlice getCalculationSlice(Integer id) {
        return em.find(CalculationResultSlice.class, id);
    }
    private BatchCalculation getBatchCalculationStatus(Integer id) {
        return em.find(BatchCalculation.class, id);
    }

    public BatchCalculation getBatchCalculationStatusAuthorized(Principal user, Integer id)
        throws NotFoundException, NotAuthorizedException {
        BatchCalculation batchCalculation = getBatchCalculationStatus(id);

        if (batchCalculation == null)
            throw new NotFoundException();
        if (!batchCalculation.getOwner().equals(user.getName()))
            throw new NotAuthorizedException(user.getName());

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

    public synchronized void delete(Principal user, Object entity) {
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

    public synchronized void delete(Principal user, int id) {
        var calc = getCalculation(id);

        if (calc == null)
            throw new NotFoundException();
        if (!calc.getOwner().equals(user.getName()))
            throw new NotAuthorizedException(user.getName());
        else {
            delete(user, calc);
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

    private Geometry coastalComplement(ScenarioCommon scenario) throws SymphonyStandardAppException {

        Geometry scenarioGeometry = scenario.getGeometry();
        Geometry excludedCoastPolygon = null;
        Map<Integer, Integer> areasExcludingCoastal = scenario.getAreasExcludingCoastal();

        if(areasExcludingCoastal.isEmpty()) {
            return null;
        } else {
            List<Integer> excludedAreaIds = areasExcludingCoastal.values().stream().toList();
            List<CalculationArea> caList = calculationAreaService.findCalculationAreas(excludedAreaIds);

            if(caList.isEmpty()){
                return null;
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
     * @return CalculationResult entity containing resulting coverage
     */
    public CalculationResult calculateScenarioImpact(Scenario scenario, boolean isAreaCalculation)
            throws FactoryException, TransformException, IOException, SymphonyStandardAppException {

        Geometry coastalComplement = coastalComplement(scenario);
        MatrixResponse matrixResponse = calculationAreaService.getAreaCalcMatrices(scenario);
        List<ScenarioArea> areas = scenario.getAreas();
        int[] ecosystemsToInclude = scenario.getEcosystemsToInclude(); // necessarily used as output param
                                                                       // for rarity adjusted calculation

        areas.sort(Comparator.comparing(ScenarioArea::getId));

        BaselineVersion baseline = baselineVersionService.getBaselineVersionById(scenario.getBaselineId());

        Overflow overflow = new Overflow();

        // To ensure consistency between results when recreating 'purged' calculations
        // and "implicit baseline calculations" for comparative calculations from the
        // resulting ScenarioSnapshots, we need to do this conspicuous "back-and-forth"
        // reprojection once before the calculation step.
        // Should we forgo this, we get tiny marginal geometric discrepancies, owing to
        // inexactness of the inverse transform operation. In turn these may (or may not)
        // produce minute numerical differences in the calculation result because of occasional
        // pixel outliers.

        MathTransform WGS84toTarget = CRS.findMathTransform(DefaultGeographicCRS.WGS84,
            getSrcCRS());
        MathTransform targetToWGS84 = CRS.findMathTransform(getSrcCRS(), DefaultGeographicCRS.WGS84);
        Geometry targetGeometry =
            JTS.transform(coastalComplement != null ?
                            coastalComplement : scenario.getGeometry(),
                WGS84toTarget);

        GridCoverage2D coverage = calculateCoverage(scenario.getOperation(), JTS.transform(targetGeometry, targetToWGS84), scenario.getBaselineId(), ecosystemsToInclude,
            scenario.getPressuresToInclude(), areas, matrixResponse, scenario.getOperationOptions(), null, overflow, coastalComplement != null);

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
            sc.areaChanges().put(a_id, area.getChangeMap());
            ++a_ix;
        }

        return scenario.getNormalization().type == PERCENTILE ?
            new CalculationResult(coverage) :
            persistCalculation( coverage, normalizationValues, areaMatrices, scenario,
                                sc, ecosystemsToInclude, baseline,
                                targetGeometry, overflow, isAreaCalculation);
    }

    public CalculationResult getImplicitBaselineCalculation(CalculationResult calc)
        throws FactoryException, TransformException, SymphonyStandardAppException, IOException {

        GridCoverage2D coverage = getImplicitBaselineCoverage(calc);
        Raster[] tmp = ((PlanarImage) coverage.getRenderedImage()).getTiles(); // trigger calculation

        CalculationResult implicitCalc = new CalculationResult(coverage);

        double[][] impactMx = (double[][]) coverage.getProperty(CumulativeImpactOp.IMPACT_MATRIX_PROPERTY_NAME);

        implicitCalc.setBaselineVersion(calc.getBaselineVersion());
        implicitCalc.setCalculationName("Baseline");
        implicitCalc.setImpactMatrix(impactMx);
        implicitCalc.setOperationName(calc.getOperation());
        implicitCalc.setOperationOptions(calc.getOperationOptions());
        implicitCalc.setScenarioSnapshot(calc.getScenarioSnapshot());
        implicitCalc.setTimestamp(new Date());

        return implicitCalc;
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

    public Integer createCompoundComparison(int[] calcResultIds, String name, Principal owner, BaselineVersion baseline) throws SymphonyStandardSystemException {

        List<CalculationResult> calcResults = em.createNamedQuery("CalculationResult.findByIds_Owner_Baseline", CalculationResult.class).
                setParameter("ids", Arrays.stream(calcResultIds).boxed().toList()).
                setParameter("username", owner.getName()).
                setParameter("baselineId", baseline.getId()).
                getResultList();

        if (calcResults.size() != calcResultIds.length)
            throw new NotFoundException();

        try {

            Raster[] tmp;
            CompoundComparison cmp = new CompoundComparison(baseline, name, owner.getName(), calcResultIds, new Date());

            for (CalculationResult calc : calcResults) {
                GridCoverage2D implicitBaseline = getImplicitBaselineCoverage(calc);
                tmp = ((PlanarImage) implicitBaseline.getRenderedImage()).getTiles(); // trigger calculation

                double[][] baselineImpact = (double[][]) implicitBaseline.getProperty(CumulativeImpactOp.IMPACT_MATRIX_PROPERTY_NAME),
                    differentiaImpact = reportService.calculateDifferentialImpactMatrix(baselineImpact, calc.getImpactMatrix());

                StatisticsResult statsA = reportService.getStatistics(implicitBaseline, false),
                                 statsB = reportService.getStatistics(calc.getCoverage(), false),
                                    stats = new StatisticsResult(
                                        statsA.min(),
                                        statsB.max() - statsA.max(),
                                        statsB.average() - statsA.average(),
                                        statsB.stddev() - statsA.stddev(), new double[0],
                                        statsA.pixels());

                ScenarioSnapshot scenario = calc.getScenarioSnapshot();

                double resolution = ReportService.getResolutionInMetres(implicitBaseline);
                double area = Double.isNaN(resolution) ?
                    scenario.getGeometry().getArea() :
                    resolution * resolution * stats.pixels();

                cmp.setCmpResultForCalculation(
                    calc.getId(),
                    new ComparisonResult(
                        scenario.getEcosystemsToInclude(),
                        scenario.getPressuresToInclude(),
                        baselineImpact,
                        differentiaImpact,
                        calc.getCalculationName(),
                        area,
                        !Double.isNaN(resolution),
                        stats, statsA));
            }

            transaction.begin();
            em.persist(cmp);
            em.flush();
            transaction.commit();

            return cmp.getId();

        } catch (Exception e) {
            throw new SymphonyStandardSystemException(SymphonyModelErrorCode.OTHER_ERROR, e, "CompoundComparison " +
                "persistence error");
        } finally {
            try {
                if (transaction.getStatus() == Status.STATUS_ACTIVE)
                    transaction.rollback();
            } catch (Throwable e) {/* ignore */}
        }
    }

    public GridCoverage2D calculateCoverage(
        int operation, Geometry roi, Integer baselineId, int[] ecosystemsToInclude, int[] pressuresToInclude,
        List<ScenarioArea> areas, MatrixResponse matrixResponse, Map<String, String> operationOptions, BandChangeEntity altScenario,
        Overflow overflow, boolean coastalExclusion)
        throws FactoryException, TransformException, SymphonyStandardAppException, IOException {
        return calculateCoverage(operation, roi, baselineId, ecosystemsToInclude, pressuresToInclude, areas, matrixResponse,
            operationOptions, altScenario, overflow, false, coastalExclusion);
    }

    public GridCoverage2D getImplicitBaselineCoverage(CalculationResult calc)
        throws SymphonyStandardAppException {

        Geometry coastalComplement = coastalComplement(calc.getScenarioSnapshot());
        Geometry roi = getROIForCalculation(calc.getScenarioSnapshot(), coastalComplement);

        return calculateCoverage(
            calc.getOperation(), roi, calc.getBaselineVersion().getId(),
            calc.getScenarioSnapshot().getEcosystemsToInclude(), calc.getScenarioSnapshot().getPressuresToInclude(),
            calc.getScenarioSnapshot().getTmpAreas(), calc.getScenarioSnapshot().getMatrixResponse(), calc.getOperationOptions(), calc.getScenarioSnapshot(), null, true, coastalComplement != null);
    }

    private GridCoverage2D calculateCoverage(
            int operation, Geometry roi, Integer baselineId, int[] ecosystemsToInclude, int[] pressuresToInclude,
            List<ScenarioArea> areas, MatrixResponse matrixResponse, Map<String, String> operationOptions, BandChangeEntity altScenario,
            Overflow overflow, boolean implicitBaseline, boolean coastalExclusion)
                throws SymphonyStandardAppException {

        try {
            GridCoverage2D ecoComponents = data.getCoverage(LayerType.ECOSYSTEM, baselineId);
            GridCoverage2D pressures = data.getCoverage(LayerType.PRESSURE, baselineId);

            if(!implicitBaseline) {
                var scenarioComponents = scenarioService.applyScenario(
                    ecoComponents,
                    pressures,
                    areas,
                    altScenario,
                    overflow
                );

                ecoComponents = scenarioComponents.getLeft();
                pressures = scenarioComponents.getRight();
            }

            MathTransform WGS84toTarget = CRS.findMathTransform(DefaultGeographicCRS.WGS84,
                ecoComponents.getCoordinateReferenceSystem());

            Geometry targetRoi = JTS.transform(roi, WGS84toTarget);

            List<SensitivityMatrix> matrices = getUniqueMatrices(matrixResponse, baselineId);
            matrices.add(0, null); // do away with this hack and compensate on paint?
            matrixResponse.areaMatrixMap.put(0, null);
            GridGeometry2D gridGeometry = ecoComponents.getGridGeometry(); // assumed identical to pressures
            ReferencedEnvelope targetEnv = JTS.bounds(targetRoi, ecoComponents.getCoordinateReferenceSystem());
            Envelope targetGridEnvelope = JTS.transform(targetEnv, gridGeometry.getCRSToGrid2D());

            ImageLayout layout = getImageLayout(targetGridEnvelope);

            var targetGridGeometry = getTargetGridGeometry(targetGridEnvelope, targetEnv);
            
            MatrixMask mask = new MatrixMask(targetGridGeometry.toCanonical(), layout,
                matrixResponse, areas, CalcUtil.createMapFromMatrixIdToIndex(matrices), coastalExclusion ? roi : null);

            // ensure band order
            Arrays.sort(ecosystemsToInclude);
            Arrays.sort(pressuresToInclude);

            GridCoverage2D coverage;
            if (operation == CalcService.OPERATION_RARITYADJUSTED) {
                // Refactor this. Enum is explicitly avoided.
                final int[] tmpEcoSystems = ecosystemsToInclude;
                var domain = operationOptions != null ?
                    operationOptions.get("domain") : "GLOBAL";
                var indices = switch (domain) {
                    case "GLOBAL":
                        yield calibrationService.calculateGlobalCommonnessIndices(ecoComponents,
                            ecosystemsToInclude, baselineId);
                    case "LOCAL":
                        yield calibrationService.calculateLocalCommonnessIndices(ecoComponents,
                            ecosystemsToInclude, areas.stream().map(a -> a.getFeature()).collect(Collectors.toList()));
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
                    ecosystemsToInclude, pressuresToInclude,
                    preprocessMatrices(matrices), layout, mask, nonZeroIndices);
            } else
                coverage = operations.cumulativeImpact(
                    CalcService.operationName(operation),
                    ecoComponents,
                    pressures,
                    ecosystemsToInclude, pressuresToInclude, preprocessMatrices(matrices), layout, mask,
                    null);

            return coverage;

        } catch (IOException e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.OTHER_ERROR, e, "Error reading data layers");
        } catch (FactoryException | TransformException e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.OTHER_ERROR, e, "Reprojection error");
        }
    }

    CoordinateReferenceSystem getSrcCRS() throws FactoryException {
        return CRS.getAuthorityFactory(true).
            createCoordinateReferenceSystem(props.getProperty("data.source.crs", ""));
    }

    private Geometry getROIForCalculation(ScenarioCommon scenario, Geometry coastalComplement) {
        try {
            return JTS.transform(coastalComplement == null ? scenario.getGeometry() : coastalComplement,
                CRS.findMathTransform(getSrcCRS(), DefaultGeographicCRS.WGS84));
        } catch (FactoryException | TransformException e) {
            throw new SymphonyStandardSystemException(SymphonyModelErrorCode.OTHER_ERROR, e, "Reprojection error");
        }
    }

    public GridCoverage2D recreateCoverageFromResult(ScenarioSnapshot scenario, CalculationResult calc)
        throws IOException, FactoryException, TransformException, SymphonyStandardAppException {
        List<ScenarioArea> areas = scenario.getTmpAreas();

        Geometry coastalComplement = coastalComplement(scenario);
        Geometry roi = getROIForCalculation(scenario, coastalComplement);

        GridCoverage2D coverage = calculateCoverage(
            calc.getOperation(),
            roi, calc.getBaselineVersion().getId(), scenario.getEcosystemsToInclude(), scenario.getPressuresToInclude(),
            areas, scenario.getMatrixResponse(), calc.getOperationOptions(), scenario, null, coastalComplement != null);

        // Trigger calculation to populate impact matrix
        var ignore = ((PlanarImage) coverage.getRenderedImage()).getTiles();

        updateCalculationData(calc.getId(), coverage);

        return coverage;
    }

    @Transactional
    public BatchCalculation queueBatchCalculation(int[] idArray, String owner, ScenarioSplitOptions options) {
        BatchCalculation batchCalculation = new BatchCalculation();
        batchCalculation.setEntities(idArray);
        batchCalculation.setOwner(owner);
        batchCalculation.setAreasCalculation(options != null);
        batchCalculation.setAreasOptions(options);

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

    public static double[][][] preprocessMatrices(List<SensitivityMatrix> sensitivityMatrices) {
        return sensitivityMatrices.stream().
                map(m -> m == null ? null : m.getMatrixValues()).
                toArray(double[][][]::new);
    }

    public CalculationResult persistCalculation(GridCoverage2D result,
                                                double[] normalizationValue,
                                                Map<Integer, Integer> areaMatrixMap,
                                                Scenario scenario,
                                                ScenarioChanges changes,
                                                int[] includedEcosystems,
                                                BaselineVersion baselineVersion,
                                                Geometry projectedRoi,
                                                Overflow overflow,
                                                boolean isAreaCalculation)
        throws IOException {
        var calculation = new CalculationResult(result);

        // TODO: Fill out some relevant TIFF metadata (such as Creator and NODATA)
        byte[] tiff = writeGeoTiff(result);      // N.B: raw result data, not normalized nor color-mapped

        synchronized (this) {
            try {
                transaction.begin();

                var snapshot = ScenarioSnapshot.makeSnapshot(scenario, projectedRoi, areaMatrixMap, normalizationValue);
                snapshot.setEcosystemsToInclude(includedEcosystems); // Override actually used only in snapshot
                snapshot.setChanges(mapper.valueToTree(changes));
                em.persist(snapshot);
                calculation.setScenarioSnapshot(snapshot);

                calculation.setRasterData(tiff);
                calculation.setOwner(scenario.getOwner());
                calculation.setCalculationName(makeCalculationName(scenario));
                calculation.setTimestamp(new Date());
                var impactMatrix = (double[][]) result.getProperty(CumulativeImpactOp.IMPACT_MATRIX_PROPERTY_NAME);
                calculation.setImpactMatrix(impactMatrix);
                calculation.setBaselineVersion(baselineVersion);
                calculation.setOperationName(scenario.getOperation());
                calculation.setOperationOptions(scenario.getOperationOptions());
                calculation.setOverflow(overflow);

                em.persist(calculation);
                em.flush(); // to have id generated

                if (!isAreaCalculation) {
                    scenario.setLatestCalculation(calculation);
                    em.merge(scenario);
                }

                transaction.commit();
            } catch (Exception e) {
                throw new SymphonyStandardSystemException(SymphonyModelErrorCode.OTHER_ERROR, e,
                    "Error persisting calculation " + calculation);
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

    public void updateCalculationData(int calculationId, GridCoverage2D coverage) {
        try {
            transaction.begin();
            var calculation = getCalculation(calculationId);
            calculation.setRasterData(writeGeoTiff(coverage));
            double[][] impactMatrix = (double[][]) coverage.getProperty(CumulativeImpactOp.IMPACT_MATRIX_PROPERTY_NAME);
            calculation.setImpactMatrix(impactMatrix);
            calculation.setTimestamp(new Date());
            em.merge(calculation);
            transaction.commit();
        } catch (Exception e) {
            throw new SymphonyStandardSystemException(SymphonyModelErrorCode.OTHER_ERROR, e,
                "Unexpected DB error while updating calculation raster");
        } finally {
            try {
                if (transaction.getStatus() == Status.STATUS_ACTIVE)
                    transaction.rollback();
            } catch (Throwable e) {}
        }
    }

    @Transactional
    public int removeCalculationTiffOlderThan(Date date) {
        return em.createNamedQuery("CalculationResult.removeOldCalculationTiff")
            .setParameter("timestamp", date)
            .executeUpdate();
    }

    String makeCalculationName(Scenario scenario) {
        var previousCalc = scenario.getLatestCalculation();
        if (previousCalc == null)
            return scenario.getName();
        else {
            var matcher = Pattern.compile(".*(\\d+)").matcher(previousCalc.getCalculationName());
            var lastSequenceNumber = matcher.find() ? Integer.parseInt(matcher.group(1)) : 1;
            var previousCalculations = findAllByUsername(scenario.getOwner());
            return findSequentialUniqueName(scenario.getName(),
                    previousCalculations.stream().map(CalculationResultSlice::getName).collect(Collectors.toList()),
                    lastSequenceNumber);
        }
    }

    public String findSequentialUniqueName(String scenarioName, List<String> previousNames, int counter) {
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

    public List<CompoundComparisonSlice> getCompoundComparisons(Principal user) {
        return em.createNamedQuery("CompoundComparison.findByOwner", CompoundComparisonSlice.class).
                setParameter("username", user.getName()).
                getResultList();
    }

    public boolean deleteCompoundComparison(Principal user, int id) {
        var cmp = em.find(CompoundComparison.class, id);

        if (cmp == null || !cmp.getOwner().equals(user.getName()))
            return false;

        delete(user, cmp);
        return true;
    }

    public CompoundComparison getCompoundComparison(int id, Principal user) {
        CompoundComparison cmp = em.find(CompoundComparison.class, id);
        if (cmp == null)
            throw new NotFoundException();
        if (!cmp.getOwner().equals(user.getName()))
            throw new NotAuthorizedException(user.getName());
        em.detach(cmp);
        return cmp;
    }
}

