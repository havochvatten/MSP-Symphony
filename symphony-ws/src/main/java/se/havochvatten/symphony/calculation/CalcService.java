package se.havochvatten.symphony.calculation;

import com.fasterxml.jackson.databind.ObjectMapper;
import it.geosolutions.jaiext.utilities.ImageLayout2;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.GridEnvelope2D;
import org.geotools.coverage.grid.GridGeometry2D;
import org.geotools.coverage.grid.io.AbstractGridFormat;
import org.geotools.data.geojson.GeoJSONReader;
import org.geotools.gce.geotiff.GeoTiffWriteParams;
import org.geotools.gce.geotiff.GeoTiffWriter;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.JTSFactoryFinder;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.geotools.util.factory.Hints;
import org.locationtech.jts.geom.Envelope;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.parameter.GeneralParameterValue;
import org.opengis.parameter.ParameterValueGroup;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.MathTransform;
import org.opengis.referencing.operation.TransformException;
import se.havochvatten.symphony.calculation.jai.CIA.CumulativeImpactOp;
import se.havochvatten.symphony.dto.*;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.entity.CalculationResult;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.scenario.Scenario;
import se.havochvatten.symphony.scenario.ScenarioService;
import se.havochvatten.symphony.scenario.ScenarioSnapshot;
import se.havochvatten.symphony.service.BaselineVersionService;
import se.havochvatten.symphony.service.CalculationAreaService;
import se.havochvatten.symphony.service.DataLayerService;
import se.havochvatten.symphony.service.PropertiesService;
import se.havochvatten.symphony.util.Util;

import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.ejb.Startup;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.media.jai.ImageLayout;
import javax.media.jai.JAI;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.servlet.http.HttpServletRequest;
import java.awt.*;
import java.awt.image.RenderedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Calculation service
 * <p>
 * In contrast to the JAI calculation operation this class is spatially aware.
 */
@Stateless // But some stuff is stored in user session!
@Startup
public class CalcService {
    private static final Logger logger = Logger.getLogger(CalcService.class.getName());

    private static ObjectMapper mapper = new ObjectMapper(); // TODO Inject instead

    @PersistenceContext(unitName = "symphonyPU")
    public EntityManager em;

    @EJB
    BaselineVersionService baselineVersionService;
    @EJB
    DataLayerService data;
    @EJB
    PropertiesService props;
    @EJB
    SymphonyCoverageProcessor processor;
    @EJB
    ScenarioService scenarioService;

    @Inject
    private CalculationAreaService calculationAreaService;


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
                .filter(c -> c.getId() != base.getId()) // omit the calculation whose matches we are
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
    public Optional<CalculationResult> getCalculation(Integer id) {
        return Optional.ofNullable(em.find(CalculationResult.class, id));
    }

    public CalculationResult updateCalculationName(CalculationResult calc, String newName) {
        calc.setCalculationName(newName);
        return em.merge(calc);
    }

    public CalculationResult updateCalculation(CalculationResult calc) {
        return em.merge(calc);
    }

    // TODO move to util?
    static byte[] writeGeoTiff(GridCoverage2D coverage, String type, float quality) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            GeoTiffWriter writer = new GeoTiffWriter(baos);
            var wp = new GeoTiffWriteParams();

            wp.setCompressionMode(GeoTiffWriteParams.MODE_EXPLICIT);
            wp.setCompressionType(type);
            wp.setCompressionQuality(quality);
            ParameterValueGroup pvg = writer.getFormat().getWriteParameters();
            pvg.parameter(
                            AbstractGridFormat.GEOTOOLS_WRITE_PARAMS.getName().toString())
                    .setValue(wp);

            writer.write(coverage, pvg.values().toArray(new GeneralParameterValue[1]));
            writer.dispose();
        } catch (IOException e) {
            logger.severe("Error making result GeoTIFF: " + e);
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
        return matrices.stream(). // do filtering in symphony-ws instead? (or use map!)
                filter(Util.distinctByKey(SensitivityMatrix::getMatrixId)).
                collect(Collectors.toList());
    }

    /**
     * Calculate an area
     *
     * @return coverage in input coordinate system (EPSG 3035 in the Swedish case)
     */
    public CalculationResult calculateScenarioImpact(HttpServletRequest req, Scenario scenario)
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
        req.getSession().setAttribute("mask", mask); // Just store image instead? Or make a Mask an a

//        Map<String, Object> props = new HashMap<>();
//        CoverageUtilities.setNoDataProperty(props, new NoDataContainer(CalcEngine.NO_DATA)); // TODO remove?

        GridCoverage2D coverage = invokeCumulativeImpactOperation(scenario, ecoComponents, pressures,
                matrices, layout, mask);

        CalculationResult calculation;
        if (scenario.getNormalization().type == NormalizationType.PERCENTILE) {
            calculation = new CalculationResult();
            calculation.setCoverage(coverage);
        } else {
            calculation = persistCalculation(coverage, matrixResponse.normalizationValue, scenario, baseline);
        }

        // Cache last calculation in session to speed up subsequent REST call to retrieve result image
        req.getSession().setAttribute("last-calculation", calculation);

        return calculation;
    }

    private GridCoverage2D invokeCumulativeImpactOperation(Scenario scenario, GridCoverage2D ecoComponents,
                                                           GridCoverage2D pressures, List<SensitivityMatrix> matrices,
                                                           ImageLayout layout, MatrixMask mask) {
        var op = processor.getOperation("se.havochvatten.CumulativeImpact");

        var params = op.getParameters();
        params.parameter("Source0").setValue(ecoComponents);
        params.parameter("Source1").setValue(pressures);
        params.parameter("matrix").setValue(preprocessMatrices(matrices));
        params.parameter("mask").setValue(mask.getRaster());
        params.parameter("ecosystemBands").setValue(scenario.getEcosystemsToInclude());
        params.parameter("pressureBands").setValue(scenario.getPressuresToInclude());

        var coverage = (GridCoverage2D) processor.doOperation(params, new Hints(JAI.KEY_IMAGE_LAYOUT, layout));
        triggerActualCalculation(coverage.getRenderedImage());

        return coverage;
    }

    /*
     * In JAI computation is done lazily. Here we explicitly request calculation of each tile (using a
     * thread-pool to perform the calculation concurrently)
     *
     * Inspired by https://github.com/geosolutions-it/soil_sealing/blob
     * /96a8c86e9ac891a273e7bc61b910416a0dbe1582/src/extension/wps-soil-sealing/wps-changematrix/src/main/java/org/geoserver/wps/gs/soilsealing/ChangeMatrixProcess.java#L669
     */
    private void triggerActualCalculation(RenderedImage renderedImage) {
        final int numTileY = renderedImage.getNumYTiles(),
                numTileX = renderedImage.getNumXTiles(),
                minTileX = renderedImage.getMinTileX(),
                minTileY = renderedImage.getMinTileY();

        final List<Point> tiles = new ArrayList<Point>(numTileX * numTileY);
        for (int i = minTileX; i < minTileX + numTileX; i++) {
            for (int j = minTileY; j < minTileY + numTileY; j++) {
                tiles.add(new Point(i, j));
            }
        }

        tiles.stream()
                .parallel() // N.B: This one is important
                .forEach(tileIndex -> renderedImage.getTile(tileIndex.x, tileIndex.y));
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
                                                BaselineVersion baselineVersion) throws IOException,
        SymphonyStandardAppException {
        var calculation = new CalculationResult();

        // TODO: Fill out some relevant TIFF metadata
        // Creator, NODATA?
        byte[] tiff = writeGeoTiff(result, "LZW", 0.90f);      // N.B: raw result data, not normalized nor color-mapped

        var snapshot = ScenarioSnapshot.makeSnapshot(scenario);
        em.persist(snapshot);
        calculation.setScenarioSnapshot(snapshot);

        calculation.setRasterData(tiff);
        calculation.setOwner(scenario.getOwner());
        calculation.setCalculationName(makeCalculationName(scenario));
        calculation.setNormalizationValue(normalizationValue);
        calculation.setTimestamp(new Date());
        var impactMatrix = (long[][]) result.getProperty(CumulativeImpactOp.IMPACT_MATRIX_PROPERTY_NAME);
        calculation.setImpactMatrix(impactMatrix);
        calculation.setCoverage(result);
        calculation.setBaselineVersion(baselineVersion);

        em.persist(calculation);
        em.flush(); // to have id generated

        scenario.setLatestCalculation(calculation);
        em.merge(scenario); // N.B: Will also persist any changes user has made to scenario since last save

        // Optionally save to disk (for debugging)
        String resultsDir = props.getProperty("results.geotiff.dir");
        if (resultsDir != null) {
            var dir = new File(resultsDir);
            if (!dir.exists())
                dir.mkdirs();

            String filename = calculation.getId() + ".tiff";
            File file = dir.toPath().resolve(filename).toFile(); //.of(dir.toString, filename).toFile();
            try (FileOutputStream stream = new FileOutputStream(file)) {
                stream.write(tiff);
            } catch (IOException e) {
                logger.warning("Error writing result GeoTIFF to disk: " + e);
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
            return findSequentialUniqueName(scenarioName, previousNames, counter + 1);
    }

    private String makeNumberedCalculationName(String name, int n) {
        return String.format(name + " (%d)", n);
    }

    /**
     * Compute (scenario-base)/base = div(sub(b,a), a)
     */
    public GridCoverage2D relativeDifference(GridCoverage2D base, GridCoverage2D scenario) {
        final var subtract = processor.getOperation("Subtract");

        var params = subtract.getParameters();
        params.parameter("Source0").setValue(scenario);
        params.parameter("Source1").setValue(base);
        var difference = (GridCoverage2D) processor.doOperation(params);

        // Do dummy add operation to promote base (denominator) image to float
        var add = processor.getOperation("AddConst");
        params = add.getParameters();
        params.parameter("Source").setValue(base);
        params.parameter("constants").setValue(new double[]{0.0});
        var floatbase = (GridCoverage2D) processor.doOperation(params);

        // FIXME integer division? promote base to float!
        // or multiply with 100?
        var divide = processor.getOperation("Divide");
        params = divide.getParameters();
        params.parameter("Source0").setValue(difference);
        params.parameter("Source1").setValue(floatbase);
        var result = (GridCoverage2D) processor.doOperation(params);

        return result;
    }
}

