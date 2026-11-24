package se.havochvatten.symphony.service;

import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.GridCoverageFactory;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.dto.Operation;
import se.havochvatten.symphony.dto.SummaryModelConfig;
import se.havochvatten.symphony.dto.SummaryModelConfig.Normalization;
import se.havochvatten.symphony.dto.SummaryModelConfig.RobustBounds;
import se.havochvatten.symphony.dto.SummaryModelConfig.Step;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;

import java.awt.image.*;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.closeTo;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class DataLayerServiceTest {

    DataLayerService dataLayerService = new DataLayerService();
    String filepathEco = "/test/eco/test_eco.tiff";
    BaselineVersion baselineVersion = new BaselineVersion();
    int baseLineVersionId = 1;

    static final GridCoverageFactory coverageFactory = new GridCoverageFactory();
    static final ReferencedEnvelope TEST_ENVELOPE = new ReferencedEnvelope(0, 1, 0, 1, null);

    @Before
    public void setUp() {
        dataLayerService.baselineVersionService = mock(BaselineVersionService.class);
        dataLayerService.props = mock(PropertiesService.class);
        dataLayerService.summaryModelConfigService = mock(SummaryModelConfigService.class);
        baselineVersion.setId(1);
        baselineVersion.setEcosystemsFilePath(filepathEco);
        when(dataLayerService.baselineVersionService.getBaselineVersionById(baseLineVersionId)).thenReturn(baselineVersion);
    }

    @Test
    public void TestComponentGetFilePath() throws SymphonyStandardAppException {
        when(dataLayerService.props.getProperty("data.localdev.ecosystems")).thenReturn(null);
        String resp = dataLayerService.getComponentFilePath(LayerType.ECOSYSTEM, baseLineVersionId);
        assertEquals(filepathEco, resp);
    }

    @Test
    public void TestComponentGetFilePathLocal() throws SymphonyStandardAppException {
        String localFilePath = "/local/test.tiff";
        when(dataLayerService.props.getProperty("data.localdev.ecosystems")).thenReturn(localFilePath);
        String resp = dataLayerService.getComponentFilePath(LayerType.ECOSYSTEM, baseLineVersionId);
        assertEquals(localFilePath, resp);
    }

    @Test
    @Ignore
    public void getDataLayer() throws IOException, SymphonyStandardAppException {
        // FIXME mock since rasters are not available on Jenkins
        var cov = dataLayerService.getDataLayer(LayerType.ECOSYSTEM, 1, 1);
        assertEquals(1, cov.getNumSampleDimensions());
    }

    // ── helpers ─────────────────────────────────────────────────────────────

    /** Builds a synthetic float GridCoverage2D. bandData[band][pixelIndex] in row-major order. */
    private static GridCoverage2D buildCoverage(int width, int height, float[]... bandData) {
        int numBands = bandData.length;
        SampleModel sm = new BandedSampleModel(DataBuffer.TYPE_FLOAT, width, height, numBands);
        DataBuffer db = new DataBufferFloat(bandData, width * height);
        WritableRaster raster = Raster.createWritableRaster(sm, db, null);
        return coverageFactory.create("test", raster, TEST_ENVELOPE);
    }

    private static float[] readOutput(GridCoverage2D cov) {
        RenderedImage img = cov.getRenderedImage();
        return img.getData().getSamples(img.getMinX(), img.getMinY(), img.getWidth(), img.getHeight(), 0, (float[]) null);
    }

    private static SummaryModelConfig makeConfig(String outputStep, Step... steps) {
        SummaryModelConfig cfg = new SummaryModelConfig();
        cfg.setOutputStep(outputStep);
        cfg.setSteps(Arrays.asList(steps));
        return cfg;
    }

    private static Step bandStep(String name, int order, Operation op, List<Integer> bands, Normalization norm) {
        Step s = new Step();
        s.setName(name);
        s.setOrder(order);
        s.setOperation(op);
        s.setBands(bands);
        s.setNormalization(norm);
        return s;
    }

    private static Step inputStep(String name, int order, Operation op, List<String> inputs, Normalization norm) {
        Step s = new Step();
        s.setName(name);
        s.setOrder(order);
        s.setOperation(op);
        s.setInputs(inputs);
        s.setNormalization(norm);
        return s;
    }

    private static Normalization linearNorm(double min, double max) {
        Normalization n = new Normalization();
        n.setType("linear");
        n.setMin(min);
        n.setMax(max);
        return n;
    }

    // ── aggregateHeatmapBySteps tests ────────────────────────────────────────

    @Test
    public void aggregateMean_singleStep_correctPerPixelMean() {
        // 2×2 raster, 2 bands. Expected per-pixel mean: (band0 + band1) / 2
        float[] band0 = {2f, 4f, 6f, 8f};
        float[] band1 = {4f, 8f, 12f, 16f};
        GridCoverage2D cov = buildCoverage(2, 2, band0, band1);

        SummaryModelConfig cfg = makeConfig("total",
            bandStep("total", 10, Operation.MEAN, Arrays.asList(0, 1), null));

        GridCoverage2D result = dataLayerService.aggregateHeatmapBySteps(cov, cfg);
        float[] out = readOutput(result);

        assertThat((double) out[0], closeTo(3.0, 0.001));  // (2+4)/2
        assertThat((double) out[1], closeTo(6.0, 0.001));  // (4+8)/2
        assertThat((double) out[2], closeTo(9.0, 0.001));  // (6+12)/2
        assertThat((double) out[3], closeTo(12.0, 0.001)); // (8+16)/2
    }

    @Test
    public void aggregateMax_singleStep_correctPerPixelMax() {
        float[] band0 = {1f, 9f, 3f, 4f};
        float[] band1 = {5f, 2f, 3f, 8f};
        GridCoverage2D cov = buildCoverage(2, 2, band0, band1);

        SummaryModelConfig cfg = makeConfig("total",
            bandStep("total", 10, Operation.MAX, Arrays.asList(0, 1), null));

        float[] out = readOutput(dataLayerService.aggregateHeatmapBySteps(cov, cfg));

        assertThat((double) out[0], closeTo(5.0, 0.001)); // max(1,5)
        assertThat((double) out[1], closeTo(9.0, 0.001)); // max(9,2)
        assertThat((double) out[2], closeTo(3.0, 0.001)); // max(3,3)
        assertThat((double) out[3], closeTo(8.0, 0.001)); // max(4,8)
    }

    @Test
    public void aggregateSum_singleStep_correctPerPixelSum() {
        float[] band0 = {1f, 2f, 3f, 4f};
        float[] band1 = {10f, 20f, 30f, 40f};
        GridCoverage2D cov = buildCoverage(2, 2, band0, band1);

        SummaryModelConfig cfg = makeConfig("total",
            bandStep("total", 10, Operation.SUM, Arrays.asList(0, 1), null));

        float[] out = readOutput(dataLayerService.aggregateHeatmapBySteps(cov, cfg));

        assertThat((double) out[0], closeTo(11.0, 0.001));
        assertThat((double) out[3], closeTo(44.0, 0.001));
    }

    @Test
    public void aggregateMean_nanSamplesExcludedFromCount() {
        // pixel0: band0=NaN, band1=6 → mean = 6/1 = 6
        // pixel1: band0=4,   band1=8 → mean = 12/2 = 6
        float[] band0 = {Float.NaN, 4f, 4f, 4f};
        float[] band1 = {6f, 8f, Float.NaN, 4f};
        GridCoverage2D cov = buildCoverage(2, 2, band0, band1);

        SummaryModelConfig cfg = makeConfig("total",
            bandStep("total", 10, Operation.MEAN, Arrays.asList(0, 1), null));

        float[] out = readOutput(dataLayerService.aggregateHeatmapBySteps(cov, cfg));

        assertThat((double) out[0], closeTo(6.0, 0.001));  // only band1 contributes
        assertThat((double) out[1], closeTo(6.0, 0.001));  // (4+8)/2
        assertThat((double) out[2], closeTo(4.0, 0.001));  // only band0 contributes
        assertThat((double) out[3], closeTo(4.0, 0.001));  // (4+4)/2
    }

    @Test
    public void aggregateMean_allNanPixel_replacedByZeroInFinalOutput() {
        // pixel0: both bands are NaN → mean step yields NaN → final output replaces NaN with 0.0f
        float[] band0 = {Float.NaN, 2f, 3f, 4f};
        float[] band1 = {Float.NaN, 4f, 6f, 8f};
        GridCoverage2D cov = buildCoverage(2, 2, band0, band1);

        SummaryModelConfig cfg = makeConfig("total",
            bandStep("total", 10, Operation.MEAN, Arrays.asList(0, 1), null));

        float[] out = readOutput(dataLayerService.aggregateHeatmapBySteps(cov, cfg));

        assertThat((double) out[0], closeTo(0.0, 0.001)); // NaN → 0.0f
        assertThat((double) out[1], closeTo(3.0, 0.001)); // (2+4)/2
    }

    @Test
    public void aggregateMax_allNanPixel_replacedByZeroInFinalOutput() {
        float[] band0 = {Float.NaN, 3f};
        float[] band1 = {Float.NaN, 5f};
        GridCoverage2D cov = buildCoverage(2, 1, band0, band1);

        SummaryModelConfig cfg = makeConfig("total",
            bandStep("total", 10, Operation.MAX, Arrays.asList(0, 1), null));

        float[] out = readOutput(dataLayerService.aggregateHeatmapBySteps(cov, cfg));

        assertThat((double) out[0], closeTo(0.0, 0.001));
        assertThat((double) out[1], closeTo(5.0, 0.001));
    }

    @Test
    public void aggregateSum_allNanPixel_replacedByZeroInFinalOutput() {
        float[] band0 = {Float.NaN, 3f};
        float[] band1 = {Float.NaN, 5f};
        GridCoverage2D cov = buildCoverage(2, 1, band0, band1);

        SummaryModelConfig cfg = makeConfig("total",
            bandStep("total", 10, Operation.SUM, Arrays.asList(0, 1), null));

        float[] out = readOutput(dataLayerService.aggregateHeatmapBySteps(cov, cfg));

        assertThat((double) out[0], closeTo(0.0, 0.001));
        assertThat((double) out[1], closeTo(8.0, 0.001));
    }

    @Test
    public void aggregateHeatmapBySteps_multiStepPipeline_intermediatesReleasedAndOutputCorrect() {
        // Step A (order 10): MEAN of band 0 → [1, 2]
        // Step B (order 20): MEAN of band 1 → [10, 20]
        // Step C (order 30, output): MEAN of inputs [A, B] → [(1+10)/2, (2+20)/2] = [5.5, 11]
        float[] band0 = {1f, 2f};
        float[] band1 = {10f, 20f};
        GridCoverage2D cov = buildCoverage(2, 1, band0, band1);

        Step stepA = bandStep("A", 10, Operation.MEAN, Arrays.asList(0), null);
        Step stepB = bandStep("B", 20, Operation.MEAN, Arrays.asList(1), null);
        Step stepC = inputStep("C", 30, Operation.MEAN, Arrays.asList("A", "B"), null);
        SummaryModelConfig cfg = makeConfig("C", stepA, stepB, stepC);

        float[] out = readOutput(dataLayerService.aggregateHeatmapBySteps(cov, cfg));

        assertThat((double) out[0], closeTo(5.5, 0.001));
        assertThat((double) out[1], closeTo(11.0, 0.001));
    }

    @Test
    public void aggregateHeatmapBySteps_outputStepNullFallsBackToLastByOrder() {
        // No outputStep set → fallback to highest-order step
        // Step X (order 10): MEAN of band 0 → [3, 3]
        // Step Y (order 20): MEAN of band 1 → [7, 7]  ← should be returned
        float[] band0 = {3f, 3f};
        float[] band1 = {7f, 7f};
        GridCoverage2D cov = buildCoverage(2, 1, band0, band1);

        Step stepX = bandStep("X", 10, Operation.MEAN, Arrays.asList(0), null);
        Step stepY = bandStep("Y", 20, Operation.MEAN, Arrays.asList(1), null);
        SummaryModelConfig cfg = makeConfig(null, stepX, stepY); // null → no outputStep

        float[] out = readOutput(dataLayerService.aggregateHeatmapBySteps(cov, cfg));

        assertThat((double) out[0], closeTo(7.0, 0.001));
        assertThat((double) out[1], closeTo(7.0, 0.001));
    }

    @Test(expected = IllegalArgumentException.class)
    public void aggregateHeatmapBySteps_unknownInputReference_throws() {
        float[] band0 = {1f, 2f};
        GridCoverage2D cov = buildCoverage(2, 1, band0);

        // Step references "ghost" which doesn't exist
        Step stepA = bandStep("A", 10, Operation.MEAN, Arrays.asList(0), null);
        Step stepB = inputStep("B", 20, Operation.MEAN, Arrays.asList("ghost"), null);
        SummaryModelConfig cfg = makeConfig("B", stepA, stepB);

        dataLayerService.aggregateHeatmapBySteps(cov, cfg);
    }

    @Test(expected = IllegalArgumentException.class)
    public void aggregateHeatmapBySteps_stepWithNoBandsAndNoInputs_throws() {
        float[] band0 = {1f, 2f};
        GridCoverage2D cov = buildCoverage(2, 1, band0);

        // Step has neither bands nor inputs → must throw
        Step stepA = new Step();
        stepA.setName("A");
        stepA.setOrder(10);
        stepA.setOperation(Operation.MEAN);
        // No bands, no inputs set
        SummaryModelConfig cfg = makeConfig("A", stepA);

        dataLayerService.aggregateHeatmapBySteps(cov, cfg);
    }

    // ── applyNormalization tests ─────────────────────────────────────────────

    @Test
    public void applyNormalization_nullNormalization_returnsIdentity() {
        float[] values = {1f, 2f, 3f};
        float[] result = dataLayerService.applyNormalization(values, null);
        assertSame(values, result);
    }

    @Test
    public void applyNormalization_nonLinearType_returnsIdentity() {
        float[] values = {1f, 2f, 3f};
        Normalization norm = new Normalization();
        norm.setType("logarithmic");
        norm.setMin(0);
        norm.setMax(100);
        float[] result = dataLayerService.applyNormalization(values, norm);
        assertSame(values, result);
    }

    @Test
    public void applyNormalization_linear_simpleScaling() {
        float[] values = {0f, 5f, 10f};
        Normalization norm = linearNorm(0, 1);
        float[] result = dataLayerService.applyNormalization(values, norm);

        assertThat((double) result[0], closeTo(0.0, 0.001));
        assertThat((double) result[1], closeTo(0.5, 0.001));
        assertThat((double) result[2], closeTo(1.0, 0.001));
    }

    @Test
    public void applyNormalization_linear_targetRange0to100() {
        float[] values = {0f, 50f, 100f};
        Normalization norm = linearNorm(0, 100);
        float[] result = dataLayerService.applyNormalization(values, norm);

        assertThat((double) result[0], closeTo(0.0, 0.01));
        assertThat((double) result[1], closeTo(50.0, 0.01));
        assertThat((double) result[2], closeTo(100.0, 0.01));
    }

    @Test
    public void applyNormalization_degenerateSourceRange_returnsIdentity() {
        // All same value → source range near-zero → no normalization applied
        float[] values = {5f, 5f, 5f};
        Normalization norm = linearNorm(0, 100);
        float[] result = dataLayerService.applyNormalization(values, norm);

        assertThat((double) result[0], closeTo(5.0, 0.001));
        assertThat((double) result[2], closeTo(5.0, 0.001));
    }

    @Test
    public void applyNormalization_degenerateTargetRange_returnsIdentity() {
        float[] values = {1f, 2f, 3f};
        Normalization norm = linearNorm(50, 50); // max - min < 0.0001
        float[] result = dataLayerService.applyNormalization(values, norm);

        // Values unchanged
        assertThat((double) result[0], closeTo(1.0, 0.001));
        assertThat((double) result[2], closeTo(3.0, 0.001));
    }

    @Test
    public void applyNormalization_nanPreserved() {
        float[] values = {Float.NaN, 5f, 10f};
        Normalization norm = linearNorm(0, 1);
        float[] result = dataLayerService.applyNormalization(values, norm);

        assertTrue(Float.isNaN(result[0]));
        assertFalse(Float.isNaN(result[1]));
    }

    @Test
    public void applyNormalization_outliersClamped_withRobustBounds() {
        // Build 200 values: most in [0..10], outlier at 1000.
        // With robust bounds p10/p90, the outlier should clamp to target max, not exceed it.
        float[] values = new float[202];
        for (int i = 0; i < 200; i++) values[i] = i * 0.05f; // 0..9.95
        values[200] = 1000f; // outlier
        values[201] = 5f;    // mid-range

        RobustBounds rb = new RobustBounds();
        rb.setRobustBoundsEnabled(true);
        rb.setLowPercentile(10);
        rb.setHighPercentile(90);
        rb.setMaxSamples(0); // no sub-sampling

        Normalization norm = new Normalization();
        norm.setType("linear");
        norm.setMin(0);
        norm.setMax(100);
        norm.setRobustBounds(rb);

        float[] result = dataLayerService.applyNormalization(values, norm);

        // The outlier at index 200 should be clamped to target max = 100
        assertThat((double) result[200], closeTo(100.0, 0.1));
        // Non-outlier mid-range value should be < 100
        assertTrue(result[201] >= 0 && result[201] <= 100);
    }

    // ── computeRobustBounds tests ────────────────────────────────────────────

    @Test
    public void computeRobustBounds_nullInput_returnsNull() {
        assertNull(dataLayerService.computeRobustBounds(null, 0.1, 0.9, 0));
    }

    @Test
    public void computeRobustBounds_emptyInput_returnsNull() {
        assertNull(dataLayerService.computeRobustBounds(new float[0], 0.1, 0.9, 0));
    }

    @Test
    public void computeRobustBounds_fewerThan100FiniteSamples_returnsNull() {
        float[] values = new float[99];
        for (int i = 0; i < values.length; i++) values[i] = i;
        assertNull(dataLayerService.computeRobustBounds(values, 0.1, 0.9, 0));
    }

    @Test
    public void computeRobustBounds_happyPath_p10p90() {
        // 1000 values [0..999]: p10 ≈ 99, p90 ≈ 899
        float[] values = new float[1000];
        for (int i = 0; i < 1000; i++) values[i] = i;

        float[] bounds = dataLayerService.computeRobustBounds(values, 0.1, 0.9, 0);

        assertNotNull(bounds);
        assertThat((double) bounds[0], closeTo(99.0, 2.0));
        assertThat((double) bounds[1], closeTo(899.0, 2.0));
    }

    @Test
    public void computeRobustBounds_allSameValue_returnsNull() {
        // Same value everywhere → high - low < 0.0001
        float[] values = new float[200];
        Arrays.fill(values, 5f);
        assertNull(dataLayerService.computeRobustBounds(values, 0.1, 0.9, 0));
    }

    @Test
    public void computeRobustBounds_nonFiniteValuesExcluded() {
        // Mix of 500 finite [0..499] and 500 NaN values
        float[] values = new float[1000];
        for (int i = 0; i < 500; i++) values[i] = i;
        Arrays.fill(values, 500, 1000, Float.NaN);

        float[] bounds = dataLayerService.computeRobustBounds(values, 0.1, 0.9, 0);

        assertNotNull(bounds);
        // bounds should be from finite values only [0..499]
        assertThat((double) bounds[0], closeTo(49.0, 5.0));  // ~p10 of [0..499]
        assertThat((double) bounds[1], closeTo(449.0, 5.0)); // ~p90 of [0..499]
    }

    @Test
    public void computeRobustBounds_subSampling_stillProducesReasonableResult() {
        // 10000 values [0..9999], maxSamples=1000 → step=10 → samples [0,10,20,...,9990]
        float[] values = new float[10000];
        for (int i = 0; i < 10000; i++) values[i] = i;

        float[] bounds = dataLayerService.computeRobustBounds(values, 0.1, 0.9, 1000);

        assertNotNull(bounds);
        // p10/p90 of the sub-sampled values should be within 10% of the true values
        assertThat((double) bounds[0], closeTo(999.0, 200.0));
        assertThat((double) bounds[1], closeTo(8999.0, 200.0));
    }

    // ── createAggregationBuffer tests ────────────────────────────────────────

    @Test
    public void createAggregationBuffer_maxInitializesToNegativeInfinity() {
        float[] buf = dataLayerService.createAggregationBuffer(4, Operation.MAX);
        for (float v : buf) {
            assertThat((double) v, is((double) Float.NEGATIVE_INFINITY));
        }
    }

    @Test
    public void createAggregationBuffer_meanInitializesToZero() {
        float[] buf = dataLayerService.createAggregationBuffer(4, Operation.MEAN);
        for (float v : buf) {
            assertThat((double) v, closeTo(0.0, 0.0));
        }
    }

    @Test
    public void createAggregationBuffer_sumInitializesToZero() {
        float[] buf = dataLayerService.createAggregationBuffer(4, Operation.SUM);
        for (float v : buf) {
            assertThat((double) v, closeTo(0.0, 0.0));
        }
    }

    // ── finalizeAggregation tests ────────────────────────────────────────────

    @Test
    public void finalizeAggregation_mean_dividesBySampleCount() {
        float[] sums = {6f, 0f};
        int[] counts = {3, 0};
        float[] result = dataLayerService.finalizeAggregation(sums, counts, null, Operation.MEAN);

        assertThat((double) result[0], closeTo(2.0, 0.001)); // 6/3
        assertTrue(Float.isNaN(result[1]));                   // 0 samples → NaN
    }

    @Test
    public void finalizeAggregation_max_noSampleBecomesNaN() {
        float[] acc = {5f, Float.NEGATIVE_INFINITY};
        boolean[] hasValue = {true, false};
        float[] result = dataLayerService.finalizeAggregation(acc, null, hasValue, Operation.MAX);

        assertThat((double) result[0], closeTo(5.0, 0.001));
        assertTrue(Float.isNaN(result[1]));
    }

    @Test
    public void finalizeAggregation_sum_noSampleBecomesNaN() {
        float[] acc = {15f, 0f};
        boolean[] hasValue = {true, false};
        float[] result = dataLayerService.finalizeAggregation(acc, null, hasValue, Operation.SUM);

        assertThat((double) result[0], closeTo(15.0, 0.001));
        assertTrue(Float.isNaN(result[1]));
    }
}
