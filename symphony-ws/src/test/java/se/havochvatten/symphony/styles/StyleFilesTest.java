package se.havochvatten.symphony.styles;

import org.geotools.styling.ColorMap;
import org.geotools.styling.ColorMapEntry;
import org.geotools.styling.StyleFactory;
import org.geotools.styling.StyledLayerDescriptor;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.GridCoverageFactory;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.junit.Test;
import org.opengis.filter.FilterFactory2;
import se.havochvatten.symphony.web.WebUtil;

import java.awt.image.BufferedImage;
import java.awt.image.ColorModel;
import java.awt.image.DataBuffer;
import java.awt.image.DataBufferByte;
import java.awt.image.Raster;
import java.awt.image.RenderedImage;
import java.awt.image.SampleModel;
import java.io.InputStream;
import java.util.Arrays;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;

/**
 * Pins the structure of the shipped style files and how values at the edges of each scale render.
 * Value 0 means "no data" in Symphony's rasters and must stay transparent. Asserts relationships between
 * rendered pixels (same colour as, opaque, transparent), never specific colours.
 */
public class StyleFilesTest {
    private static final double EPS = 1e-9;
    private static final double[] PERCENT_STOPS = {1, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 100};
    private static final double[] COMPARISON_QUANTITIES =
        {-0.45, -0.30, -0.15, -0.05, -0.01, 0, 0.01, 0.05, 0.15, 0.30, 0.45};
    private static final double[] RESULT_STOPS = Arrays.stream(PERCENT_STOPS).map(p -> p / 100).toArray();

    @Test
    public void ecosystemAndPressureHavePlaceholdersAnd13Stops() throws Exception {
        for (String style : new String[]{"styles/ecosystem.xml", "styles/pressure.xml"}) {
            assertPlaceholdersAndStops(style, PERCENT_STOPS);
        }
    }

    @Test
    public void resultHasPlaceholdersAnd13Stops() throws Exception {
        assertPlaceholdersAndStops("styles/result-style.xml", RESULT_STOPS);
    }

    @Test
    public void comparisonKeepsElevenEntriesAndQuantities() throws Exception {
        assertArrayEquals(COMPARISON_QUANTITIES, quantities(colorMap("styles/comparison.xml").getColorMapEntries()),
            EPS);
    }

    @Test
    public void ecosystemAndPressureLeaveZeroTransparentAndDrawBelowFirstStopInFirstColour() throws Exception {
        for (String style : new String[]{"styles/ecosystem.xml", "styles/pressure.xml"}) {
            int[] argb = renderRow(style, new float[]{0f, 0.5f, 1f, 50f}, null);
            assertEquals(style + ": value 0 (no data) transparent", 0, alpha(argb[0]));
            assertEquals(style + ": value 0.5 same as first stop", argb[2], argb[1]);
            assertEquals(style + ": value 0.5 opaque", 255, alpha(argb[1]));
            assertNotEquals(style + ": first stop differs from 50", argb[3], argb[2]);
        }
    }

    @Test
    public void ecosystemAndPressureValuesAboveTopStopUseTopColour() throws Exception {
        for (String style : new String[]{"styles/ecosystem.xml", "styles/pressure.xml"}) {
            int[] argb = renderRow(style, new float[]{100f, 150f, 50f}, null);
            assertEquals(style + ": value 150 same as top stop", argb[0], argb[1]);
            assertEquals(style + ": value 150 opaque", 255, alpha(argb[1]));
            assertNotEquals(style + ": top stop differs from 50", argb[2], argb[0]);
        }
    }

    @Test
    public void ecosystemAndPressureAreSmoothBetweenStops() throws Exception {
        for (String style : new String[]{"styles/ecosystem.xml", "styles/pressure.xml"}) {
            int[] argb = renderRow(style, new float[]{1f, 3f, 5f}, null);
            assertNotEquals(style + ": 3 differs from 1", argb[0], argb[1]);
            assertNotEquals(style + ": 3 differs from 5", argb[2], argb[1]);
        }
    }

    @Test
    public void resultLeavesZeroTransparentAndUsesEndColoursOutsideTheStops() throws Exception {
        int[] argb = renderRow("styles/result-style.xml", new float[]{0f, 0.005f, 0.01f, 1.0f, 1.5f}, 1.0);
        assertEquals("value 0 (no data) transparent", 0, alpha(argb[0]));
        assertEquals("value 0.005 same as first stop", argb[2], argb[1]);
        assertEquals("value 1.5 same as top stop", argb[3], argb[4]);
        for (int i = 1; i < argb.length; i++) {
            assertEquals("pixel " + i + " opaque", 255, alpha(argb[i]));
        }
    }

    @Test
    public void legendShowsExactlyTheVisibleStops() throws Exception {
        assertLegendStops("styles/ecosystem.xml", PERCENT_STOPS);
        assertLegendStops("styles/pressure.xml", PERCENT_STOPS);
        assertLegendStops("styles/result-style.xml", RESULT_STOPS);
    }

    @Test
    public void legendStillSkipsASingleTransparentPlaceholder() {
        // A style file in develop's format: one transparent placeholder, then the visible stops
        StyleFactory sf = CommonFactoryFinder.getStyleFactory();
        FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
        ColorMapEntry placeholder = sf.createColorMapEntry();
        placeholder.setColor(ff.literal("#000000"));
        placeholder.setQuantity(ff.literal(0));
        placeholder.setOpacity(ff.literal(0));
        ColorMapEntry first = sf.createColorMapEntry();
        first.setColor(ff.literal("#111111"));
        first.setQuantity(ff.literal(1));
        ColorMapEntry second = sf.createColorMapEntry();
        second.setColor(ff.literal("#222222"));
        second.setQuantity(ff.literal(5));

        assertArrayEquals(new int[]{1, 2},
            WebUtil.visibleLegendEntryIndices(new ColorMapEntry[]{placeholder, first, second}));
    }

    @Test
    public void legendKeepsEveryStopOfAFlatBandAfterTheFirstVisibleStop() {
        // A custom style file where two visible stops share a colour on purpose
        ColorMapEntry[] entries = {
            entry("#111111", 0, 0.0),
            entry("#111111", 1, null),
            entry("#222222", 5, null),
            entry("#222222", 10, null),
            entry("#333333", 20, null)
        };

        assertArrayEquals(new int[]{1, 2, 3, 4}, WebUtil.visibleLegendEntryIndices(entries));
    }

    private static ColorMapEntry entry(String color, double quantity, Double opacity) {
        StyleFactory sf = CommonFactoryFinder.getStyleFactory();
        FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
        ColorMapEntry entry = sf.createColorMapEntry();
        entry.setColor(ff.literal(color));
        entry.setQuantity(ff.literal(quantity));
        if (opacity != null) {
            entry.setOpacity(ff.literal(opacity));
        }
        return entry;
    }

    private void assertPlaceholdersAndStops(String style, double[] stops) throws Exception {
        double[] quantities = quantities(colorMap(style).getColorMapEntries());
        assertEquals(style + ": two placeholders plus stops", stops.length + 2, quantities.length);
        for (int i = 1; i < quantities.length; i++) {
            assertTrue(style + ": quantities strictly increasing at " + i, quantities[i] > quantities[i - 1]);
        }
        assertEquals(style + ": transparent placeholder at 0", 0.0, quantities[0], EPS);
        assertArrayEquals(style + ": visible stops", stops, Arrays.copyOfRange(quantities, 2, quantities.length),
            EPS);
    }

    private void assertLegendStops(String style, double[] stops) throws Exception {
        ColorMapEntry[] entries = colorMap(style).getColorMapEntries();
        int[] indices = WebUtil.visibleLegendEntryIndices(entries);
        ColorMapEntry[] shown = Arrays.stream(indices).mapToObj(i -> entries[i]).toArray(ColorMapEntry[]::new);
        assertArrayEquals(style + ": legend entries", stops, quantities(shown), EPS);
    }

    private StyledLayerDescriptor sld(String resource) throws Exception {
        try (InputStream in = getClass().getClassLoader().getResourceAsStream(resource)) {
            return WebUtil.getSLD(in);
        }
    }

    private ColorMap colorMap(String resource) throws Exception {
        return WebUtil.getRasterSymbolizer(sld(resource)).getColorMap();
    }

    private static double[] quantities(ColorMapEntry[] entries) {
        double[] result = new double[entries.length];
        for (int i = 0; i < entries.length; i++) {
            result[i] = entries[i].getQuantity().evaluate(null, Double.class);
        }
        return result;
    }

    private int[] renderRow(String resource, float[] values, Double normalization) throws Exception {
        GridCoverage2D cov = new GridCoverageFactory().create("t", new float[][]{values},
            new ReferencedEnvelope(0, values.length, 0, 1, DefaultGeographicCRS.WGS84));
        ReferencedEnvelope env = new ReferencedEnvelope(cov.getEnvelope());
        RenderedImage img = normalization == null
            ? WebUtil.render(cov, DefaultGeographicCRS.WGS84, env, sld(resource))
            : WebUtil.renderNormalized(cov, DefaultGeographicCRS.WGS84, env, sld(resource), normalization);

        // Same conversion as DataLayerREST.buildImageResponse
        byte[] samples = (byte[]) img.getData().getDataElements(img.getMinX(), img.getMinY(),
            img.getWidth(), img.getHeight(), null);
        DataBuffer buf = new DataBufferByte(samples, samples.length);
        SampleModel sm = img.getSampleModel().createCompatibleSampleModel(img.getWidth(), img.getHeight());
        ColorModel cm = img.getColorModel();
        BufferedImage image = new BufferedImage(cm, Raster.createWritableRaster(sm, buf, null), false, null);

        assertEquals("one pixel per value", values.length, image.getWidth());
        int[] argb = new int[values.length];
        for (int x = 0; x < values.length; x++) {
            argb[x] = image.getRGB(x, 0);
        }
        return argb;
    }

    private static int alpha(int argb) {
        return (argb >>> 24) & 0xff;
    }
}
