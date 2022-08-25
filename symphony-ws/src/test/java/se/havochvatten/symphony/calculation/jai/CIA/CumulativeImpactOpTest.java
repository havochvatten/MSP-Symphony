package se.havochvatten.symphony.calculation.jai.CIA;

import org.junit.BeforeClass;
import org.junit.Test;

import javax.imageio.ImageIO;
import javax.media.jai.ImageLayout;
import javax.media.jai.JAI;
import javax.media.jai.ParameterBlockJAI;
import java.awt.*;
import java.awt.image.Raster;
import java.awt.image.RenderedImage;
import java.io.File;
import java.io.IOException;
import java.util.Arrays;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;

public class CumulativeImpactOpTest {

    static double[][] unitMatrix = new double[][]{ // TODO Add non-zero correlations
            {1.0, 0.0}, // k[0][0]=1.0
            {0.0, 1.0}  // k[1][1]=1.0
    };

    final double DELTA = 0.1;

    static CumulativeImpactDescriptor op = new CumulativeImpactDescriptor();

    static Raster passThroughMask; // Will pass through all values
    static RenderedImage singleDataLayer;
    static RenderedImage twoBandLayers;

    @BeforeClass
    public static void setup() throws IOException {
        var mask = new File(
                Thread.currentThread().getContextClassLoader().getResource("unittest/passthrough-mask.tif").getPath());
        passThroughMask = ImageIO.read(mask).getData();

        var layer = new File(
                Thread.currentThread().getContextClassLoader().getResource("unittest/unit100-2x2.tif").getPath());
        singleDataLayer = ImageIO.read(layer);

        var layers = new File(
                Thread.currentThread().getContextClassLoader().getResource("unittest/unit100-2x2x2.tif").getPath());
        twoBandLayers = ImageIO.read(layers);
    }

    @Test
    public void testSingleBandCalculation() {
        ParameterBlockJAI pb = new ParameterBlockJAI(op);
        pb.setSource("source0", singleDataLayer);
        pb.setSource("source1", singleDataLayer);
        pb.setParameter("matrix", new double[][][]{{{}}, {{1.0}}});
        pb.setParameter("mask", passThroughMask);
        pb.setParameter("ecosystemBands", new int[]{0});
        pb.setParameter("pressureBands", new int[]{0});

        var hints = new RenderingHints(JAI.KEY_IMAGE_LAYOUT, new ImageLayout(singleDataLayer));
        var out = op.create(pb, hints);

/*
        ImageLayout layout = new ImageLayout(singleDataLayer); // copy most data, but change band count
        layout.setSampleModel(RasterFactory.createComponentSampleModel(
                singleDataLayer.getSampleModel(),
                DataBuffer.TYPE_INT, singleDataLayer.getWidth(), singleDataLayer.getHeight(), 1));
        CumulativeImpactOp out = new CumulativeImpactOp(singleDataLayer, singleDataLayer, layout,
                JAI.getDefaultInstance().getRenderingHints(), new double[][] {{1.0}}, passThroughMask);
        out.finish();
*/
        // Can get a reference to the PlanarImage using #getRendering().
        // We can get the PlanarImage like so: out.getRendering()
        Raster r = out.getData(); // do the actual calculation
        assertEquals(1, r.getNumBands());
        assertArrayEquals(new int[]{
                10000, 0,
                0, 10000
        }, r.getSamples(0, 0, 2, 2, 0, new int[4]));

        var matrix = (double[][]) out.getProperty(CumulativeImpactOp.IMPACT_MATRIX_PROPERTY_NAME);
        assertEquals(20000.0, matrix[0][0], DELTA);
    }

    @Test
    public void testDoubleBandCalculation() {
        ParameterBlockJAI pb = new ParameterBlockJAI(op);
        pb.setSource("source0", twoBandLayers);
        pb.setSource("source1", twoBandLayers);
        pb.setParameter("matrix", new double[][][]{{{}}, unitMatrix});
        pb.setParameter("mask", passThroughMask);
        pb.setParameter("ecosystemBands", new int[]{0, 1});
        pb.setParameter("pressureBands", new int[]{0, 1});
        var hints = new RenderingHints(JAI.KEY_IMAGE_LAYOUT, new ImageLayout(twoBandLayers));

        RenderedImage out = op.create(pb, hints);

        Raster r = out.getData(); // trigger the actual calculation

        assertEquals(1, r.getNumBands());
        assertArrayEquals(new int[]{
                20000, 0,
                0, 20000
        }, r.getSamples(0, 0, 2, 2, 0, new int[4]));

        var matrix = (double[][]) out.getProperty(CumulativeImpactOp.IMPACT_MATRIX_PROPERTY_NAME);
        assertMatrixEquals(new double[][]{
                {20000, 0},
                {0, 20000}
        }, matrix);
    }

    void assertMatrixEquals(double[][] expected, double[][] actual) {
        var flattenedExpectations = Arrays.stream(expected).flatMapToDouble(Arrays::stream).toArray();
        var flattenedReality = Arrays.stream(actual).flatMapToDouble(Arrays::stream).toArray();
        assertArrayEquals(flattenedExpectations, flattenedReality, DELTA);
    }
}
