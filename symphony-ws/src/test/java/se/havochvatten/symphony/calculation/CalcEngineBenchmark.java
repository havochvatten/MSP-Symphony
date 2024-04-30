package se.havochvatten.symphony.calculation;

import com.fasterxml.jackson.databind.ObjectMapper;
import it.geosolutions.jaiext.JAIExt;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.GridCoverageFactory;
import org.geotools.coverage.grid.GridEnvelope2D;
import org.geotools.coverage.grid.GridGeometry2D;
import org.geotools.data.geojson.GeoJSONWriter;
import org.geotools.gce.geotiff.GeoTiffReader;
import org.geotools.gce.geotiff.GeoTiffWriter;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.geotools.util.factory.Hints;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.opengis.coverage.grid.GridCoverage;
import org.openjdk.jmh.annotations.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.dto.MatrixResponse;
import se.havochvatten.symphony.dto.SensitivityMatrix;
import se.havochvatten.symphony.entity.ScenarioArea;
import se.havochvatten.symphony.service.CalcService;

import javax.media.jai.ImageLayout;
import javax.media.jai.JAI;
import javax.media.jai.ParameterBlockJAI;
import javax.media.jai.RenderedOp;
import java.awt.*;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.IntStream;

import static org.junit.Assert.assertEquals;

@State(Scope.Benchmark)
public class CalcEngineBenchmark {
    static final Logger LOG = LoggerFactory.getLogger(CalcEngineBenchmark.class);

    static final ObjectMapper mapper = new ObjectMapper();
    static final String OUT_DIR = "target/benchmark-output";

    static {
        JAIExt.initJAIEXT();
        var scheduler = JAI.getDefaultInstance().getTileScheduler();
        int parallelism = Runtime.getRuntime().availableProcessors();
        scheduler.setParallelism(parallelism);
        scheduler.setPrefetchParallelism(parallelism);
        var cache = JAI.getDefaultInstance().getTileCache();
//        cache.setMemoryThreshold(0.80f);
        int gigsOfCache = 1;
        cache.setMemoryCapacity(gigsOfCache * 1024 * 1024 * 1024L);
    }

//    static RenderedImage createTestImage() {
//        byte[] data = {1, 1, 2, 2, 3, 3, 4, 4}; // two bands
//
//        DataBufferByte buf = new DataBufferByte(data, data.length);
//        WritableRaster rast = Raster.createWritableRaster(
//                new PixelInterleavedSampleModel(DataBuffer.TYPE_BYTE, 2, 2, 2, 4, new int[] {0, 1}),
//                buf, null);
////        ColorModel cm = new ComponentColorModel(ColorSpace.getInstance(ColorSpace.CS_GRAY),
////                false, true, Transparency.OPAQUE, DataBuffer.TYPE_BYTE);
////        BufferedImage img = new BufferedImage(cm, rast, true, null);
//        BufferedImage img = new BufferedImage(2, 2, BufferedImage.TYPE_CUSTOM);
//        img.setData(rast);
//        return img;
//    }

    GridCoverage2D ecosystems;
    GridCoverage2D pressures;
    GridGeometry2D gridGeometry;
    List<SensitivityMatrix> matrices = new ArrayList<>(Arrays.asList(null,
            new SensitivityMatrix(Västerhavet2018.ID, Västerhavet2018.K)));

//    WritableRaster rast;

    @Setup
    public void prepare() throws IOException {
        // Perhaps make use of TemporaryFolder Rule later
        File f = new File(OUT_DIR);
        if (!f.exists()) {
            boolean res = f.mkdirs();
            if (!res)
                System.err.println("Error creating output directory " + f);
        }

        File ecoFile = new File(getClass().getClassLoader().getResource(
            "SGU-2019-multiband/ecocomponents-tiled-packbits.tif").getFile());
        File presFile = new File(getClass().getClassLoader().getResource(
            "SGU-2019-multiband/pressures-tiled-packbits.tif").getFile());

        Hints hints = new Hints(
                Hints.FORCE_LONGITUDE_FIRST_AXIS_ORDER, Boolean.TRUE,
                Hints.USE_JAI_IMAGEREAD, Boolean.FALSE); // disable streaming read for benchmark purposes
        ecosystems = new GeoTiffReader(ecoFile, hints).read(null);
        pressures = new GeoTiffReader(presFile, hints).read(null);
        assertEquals(ecosystems.getEnvelope(), pressures.getEnvelope());

        gridGeometry = ecosystems.getGridGeometry();
        assertEquals(gridGeometry, pressures.getGridGeometry());
    }

//    public void doit() {
//        var res = sum();
//    }

//    @Benchmark
//    @Fork(value = 1, warmups = 0, jvmArgs = {"-Xmx10G"}) // value = 0 when debugging!
//    @BenchmarkMode(Mode.SingleShotTime)
//    public void allOfIt() throws Exception {
//        var envelope = new ReferencedEnvelope(ecosystems.getEnvelope());
//        var t = CRS.findMathTransform(ecosystems.getCoordinateReferenceSystem2D(),
//                DefaultGeographicCRS.WGS84);
//        // FIXME geometry too big?
//        var WGS84envelope = JTS.transform(envelope, t);
//        sum(JTS.toGeometry(WGS84envelope), "all-of-it");
//    }

    @Benchmark
    @Threads(10)
    @Fork(value = 10, warmups = 1) // value = 0 when debugging!
    @BenchmarkMode(Mode.SingleShotTime)
    public void smallerRegion() throws Exception {
        Coordinate[] coords =
                new Coordinate[]{ // Rectangle in the south-east archipelago of Gothenburg
                        new Coordinate(4428000, 3826000),
                        new Coordinate(4430000, 3826000),
                        new Coordinate(4430000, 3830000),
                        new Coordinate(4428000, 3830000),
                        new Coordinate(4428000, 3826000),
                };
        var crs = CRS.getAuthorityFactory(true).createCoordinateReferenceSystem("EPSG:3035");

        sum(TestUtil.makeROI(coords, crs), "smaller-region");
    }


    public void sum(Geometry roi, String name) throws Exception {
        // area
//        var transform = CRS.findMathTransform(gridGeometry.getCoordinateReferenceSystem2D(),
//        DefaultGeographicCRS.WGS84);
//        var geographicRoi = JTS.transform(bbox, transform);

        ScenarioArea[] areas = new ScenarioArea[]{ new ScenarioArea() };

        String jsonRoi = GeoJSONWriter.toGeoJSON(roi);

        var featureJsonTpl = "{ \"type\": \"Feature\", \"geometry\": %s, " +
            "\"id\": \"features.3\", \"properties\": { \"name\": \"example feature\", \"title\": \"example feature\", " +
            "\"statePath\": [\"state\", \"path\"], \"changes\": {}, \"matrix\": {\n" +
            "  \"matrixType\": \"OPTIONAL\",\n" +
            "  \"matrixId\": 242\n" +
            "} } }";

        areas[0].setFeature(mapper.readTree(String.format(featureJsonTpl, jsonRoi)));
        areas[0].setId(1);

        List<SensitivityMatrix> matrices = new ArrayList<>();
        matrices.add(null); // the null element
        matrices.add(new SensitivityMatrix(242, Västerhavet2018.K));
//        double[][][] matrices = new double[][][] {
//                {}, // the null element
//                Västerhavet2018.K
//        };

//        var roiEnvelope = JTS.bounds(roi, DefaultGeographicCRS.WGS84);
//        var roiEnvProjected = JTS.transform(roiEnvelope, CRS.findMathTransform(DefaultGeographicCRS.WGS84,
//                ecosystems.getCoordinateReferenceSystem2D()));
//        var JTS.bounds()
        var targetRoi = JTS.transform(roi, CRS.findMathTransform(DefaultGeographicCRS.WGS84,
                ecosystems.getCoordinateReferenceSystem2D()));
        var targetEnv = JTS.bounds(targetRoi, ecosystems.getCoordinateReferenceSystem2D());

        var gridGeometry = ecosystems.getGridGeometry();
        var roiGridEnvelope = JTS.transform(targetEnv, gridGeometry.getCRSToGrid2D());
//        var roiGridEnvelope = targetEnv.transform(gridGeometry.getCoordinateReferenceSystem2D(), false);
        var roiGridGeomtry = new GridGeometry2D( // FIXME reuse roiGridEnvelope
                new GridEnvelope2D(/*roiGridEnvelope, PixelInCell.CELL_CENTER */
                        (int) roiGridEnvelope.getMinX(),
                        (int) roiGridEnvelope.getMinY(),
                        (int) roiGridEnvelope.getWidth(),
                        (int) roiGridEnvelope.getHeight()
                ),
                new ReferencedEnvelope(targetEnv, ecosystems.getCoordinateReferenceSystem2D()));
//        var transform  = CRS.findMathTransform(ecosystems.getCoordinateReferenceSystem2D(),
//                gridGeometry.getCRSToGrid2D());


//        var width = gridGeometry.getGridRange2D().getSpan(0);
//        var height = gridGeometry.getGridRange2D().getSpan(1);

//        var croppedEcosystems = (GridCoverage2D) Operations.DEFAULT.crop(ecosystems, bbox);
//        var croppedPressures = (GridCoverage2D) Operations.DEFAULT.crop(pressures, bbox);
//        var croppedInput = croppedEcosystems;
//        RenderedImage croppedEcosystems, croppedPressures;
//        if (roi.equals(JTS.toGeometry(new ReferencedEnvelope(ecosystems.getEnvelope())))) {
//            croppedEcosystems = ecosystems.getRenderedImage();
//            croppedPressures = pressures.getRenderedImage();
//        }
//        else {
//            ParameterBlock pb = new ParameterBlock();
//            pb.addSource(ecosystems.getRenderedImage());
//            pb.add((float) roiGridEnvelope.getMinX());
//            pb.add((float) roiGridEnvelope.getMinY());
//            pb.add((float) roiGridEnvelope.getWidth());
//            pb.add((float) roiGridEnvelope.getHeight());
//            croppedEcosystems = JAI.create("crop", pb);
//
//            pb.setSource(pressures.getRenderedImage(), 0);
//    //        pb2.addSource(pressures.getRenderedImage());
//    //        pb2.add(roiGridEnvelope.getMinX());
//    //        pb2.add(roiGridEnvelope.getMinY());
//    //        pb2.add(roiGridEnvelope.getWidth());
//    //        pb2.add(roiGridEnvelope.getHeight());
//            croppedPressures = JAI.create("crop", pb);
//        }

        ImageLayout layout = new ImageLayout((int) roiGridEnvelope.getMinX(), (int) roiGridEnvelope.getMinY(),
                (int) roiGridEnvelope.getWidth(), (int) roiGridEnvelope.getHeight());

//        var mask = new Mask(gridEnvelope/*croppedInput.getGridGeometry().toCanonical()*/, List.of(area),
//                Map.of(Västerhavet2018.ID, 1));
//        var maskImage = new BufferedImage(layout.getWidth(null), layout.getHeight(null),
//                BufferedImage.TYPE_BYTE_INDEXED, CalcUtil.makeIndexedColorModel(new Color[] {Color.black,
//                Color.blue}));
//        var g = maskImage.createGraphics();
//        g.setColor(Color.blue);
//        g.fillRect(0, 0, maskImage.getWidth(), maskImage.getHeight());
//        CalcUtil.writePNGToFile(mask.getImage(), new File(Paths.get(OUT_DIR, "mask.png").toString()));

//        var rast = engine.sum(ecoComponents.getRenderedImage(), pressures.getRenderedImage(),
//               mask.getImage(), matrices,
////                List.of(2), // cod
//                IntStream.range(0, ecoComponents.getNumSampleDimensions()).boxed().collect(Collectors
//                .toList()),
//                IntStream.range(0, pressures.getNumSampleDimensions()).boxed().collect(Collectors.toList()),
//                new HashMap<>());
//        var ms = new double[][][] {
//                {}, // the null element
//                matrices.get(1).getMatrixValues()
//        };

//        var mask = maskImage.getRaster()
//                .createWritableTranslatedChild(layout.getMinX(null), layout.getMinY(null));

        MatrixResponse mxr = new MatrixResponse(new int[]{ 1 });
        mxr.setAreaMatrixId(1, 242);

        var mask = new MatrixMask(roiGridGeomtry.toCanonical(), layout, mxr,
                List.of(areas), CalcUtil.createMapFromMatrixIdToIndex(matrices));
        ParameterBlockJAI pb = new ParameterBlockJAI("se.havochvatten.symphony.CumulativeImpact");
        pb.setSource("source0", /*croppedEcosystems*/ecosystems.getRenderedImage());
        pb.setSource("source1", /*croppedPressures*/pressures.getRenderedImage());
        pb.setParameter("matrix", CalcService.preprocessMatrices(matrices));
        pb.setParameter("mask", mask.getRaster());
        pb.setParameter("ecosystemBands", IntStream.range(0, ecosystems.getNumSampleDimensions()).toArray());
        pb.setParameter("pressureBands", IntStream.range(0, pressures.getNumSampleDimensions()).toArray());

        var hints = new RenderingHints(JAI.KEY_IMAGE_LAYOUT, layout);
        // pass image layout somehow
        var result = JAI.create("se.havochvatten.symphony.CumulativeImpact", pb, hints);

        final int numTileX = result.getNumXTiles();
        final int numTileY = result.getNumYTiles();
        final int minTileX = result.getMinTileX();
        final int minTileY = result.getMinTileY();
        final List<Point> tiles = new ArrayList<>(numTileX * numTileY);
        for (int i = minTileX; i < minTileX + numTileX; i++) {
            for (int j = minTileY; j < minTileY + numTileY; j++) {
                tiles.add(new Point(i, j));
            }
        }
        final RenderedOp temp = result;
        // Inspired by https://github.com/geosolutions-it/soil_sealing/blob/96a8c86e9ac891a273e7bc61b910416a0dbe1582/src/extension/wps-soil-sealing/wps-changematrix/src/main/java/org/geoserver/wps/gs/soilsealing/ChangeMatrixProcess.java#L669
        var rendering = tiles.stream()
                .parallel()
                .map(p -> temp.getTile(p.x, p.y))
                .toArray();
//        for (final Point tile : tiles)
//        temp.queueTiles(tiles.toArray(Point[]::new));
//        TileScheduler ts = (TileScheduler) temp.getRenderingHint(JAI.KEY_TILE_SCHEDULER);
//        temp.prefetchTiles(tiles.toArray(Point[]::new));
//        ts.prefetchTiles(temp, tiles.toArray(Point[]::new));
        // TODO create listener, listen for finished even using CountDownLatch
//        var rendering = result.getRendering();

        GridCoverage coverage = new GridCoverageFactory().create("Cumulative impact", result,
                ecosystems.getEnvelope());
//
//        GridCoverage2D extrema = (GridCoverage2D)Operations.DEFAULT.extrema(coverage);
//        var max = ((double[])extrema.getProperty("maximum"))[0];
//        System.out.println("Maximum value="+max);

        var file = Files.createTempFile(Path.of(OUT_DIR), name.concat("-"), ".tiff").toFile();
//        var tiff = new File(Paths.get(OUT_DIR, "benchmark-result.tiff").toString());
        var writer = new GeoTiffWriter(file);
        writer.write(coverage, null);
        writer.dispose();

//        GridCoverage2D normalized =
//                (GridCoverage2D) Operations.DEFAULT.divideBy(cov, new double[] {max});
//
//        var targetCRS = CRS.decode("EPSG:3035");
//        GridCoverageRenderer renderer = new GridCoverageRenderer(targetCRS,
//                new ReferencedEnvelope(gridGeometry.getEnvelope()), gridGeometry.getGridRange2D(), null);
//        StyledLayerDescriptor sld = WebUtil.getSLD(getClass().getClassLoader().getResourceAsStream
//        ("styles" +
//                "/result-style.xml"));
//        RasterSymbolizer symbolizer = WebUtil.getRasterSymbolizer(sld);
//        RenderedImage img = renderer.renderImage(normalized, symbolizer, new double[]{});

//        CalcUtil.writePNGToFile(img, new File(Paths.get(OUT_DIR, "CodFate.png").toString()));
//        blackhole.consume(rendering);
    }

    // Perhaps write output result to a file
    // @TearDown

    public static void main(String[] args) throws Exception {
        org.openjdk.jmh.Main.main(args);
    }
}
