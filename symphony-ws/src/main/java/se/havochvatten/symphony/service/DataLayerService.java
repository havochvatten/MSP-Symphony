package se.havochvatten.symphony.service;

import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.GridCoverageFactory;
import org.geotools.coverage.grid.io.AbstractGridFormat;
import org.geotools.coverage.grid.io.GridFormatFinder;
import org.geotools.coverage.processing.Operations;
import org.geotools.util.factory.Hints;
import se.havochvatten.symphony.dto.Operation;
import se.havochvatten.symphony.dto.SummaryModelConfig;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.entity.BaselineVersion;

import java.awt.*;
import java.awt.image.*;
import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.List;

import static se.havochvatten.symphony.dto.Operation.MEAN;

@Stateless
public class DataLayerService {

    @EJB
    BaselineVersionService baselineVersionService;

    @EJB
    PropertiesService props;

    @EJB
    SummaryModelConfigService summaryModelConfigService;

    /**
     * Loads the full multi-band grid coverage for a layer type and baseline.
     *
     * <p>The returned coverage is the raw raster source used by subsequent data-layer and summary model operations.
     * The GeoTools reader is configured to force longitude-first axis ordering for consistent CRS handling.</p>
     *
     * @param type              layer family to load (e.g. ecosystem/pressure)
     * @param baselineVersionId baseline version identifier used to resolve source file path
     * @return full source coverage
     * @throws IOException if raster file cannot be located or read
     */
    public GridCoverage2D getCoverage(LayerType type, int baselineVersionId) throws IOException {
        String filename = getComponentFilePath(type, baselineVersionId);
        File file = new File(filename);
        // See https://docs.geotools.org/latest/userguide/library/referencing/order.html
        Hints hints = new Hints(Hints.FORCE_LONGITUDE_FIRST_AXIS_ORDER, Boolean.TRUE);
        AbstractGridFormat format = GridFormatFinder.findFormat(file);
        var reader = format.getReader(file, hints);
        try {
            return reader.read(null);
        } finally {
            reader.dispose();
        }
    }

    /**
     * Returns a single-band coverage extracted from the full source coverage.
     *
     * @param type              layer family to load
     * @param baselineVersionId baseline version identifier
     * @param bandNo            zero-based band index to extract
     * @return one-band coverage for the selected sample dimension
     * @throws IOException if source coverage cannot be read
     */
    public GridCoverage2D getDataLayer(LayerType type, int baselineVersionId, int bandNo) throws IOException {
        var coverage = getCoverage(type, baselineVersionId);
        return (GridCoverage2D) Operations.DEFAULT.selectSampleDimension(coverage, new int[]{bandNo});
    }

    /**
     * Builds a heatmap coverage from the source raster and a summary model configuration.
     *
     * <p>Execution flow:
     * <ol>
     *   <li>Load full source coverage</li>
     *   <li>Load model config (step pipeline)</li>
     *   <li>Aggregate/normalize step results into one output raster</li>
     *   <li>Dispose source coverage resources in {@code finally}</li>
     * </ol>
     * </p>
     *
     * @param type              layer family
     * @param baseline          baseline
     * @param model             model key (e.g. simple/balanced)
     * @return generated single-band heatmap coverage of the summary model
     * @throws IOException if reading source data fails
     */
    public GridCoverage2D getSummaryModel(LayerType type, BaselineVersion baseline, String model) throws IOException {
        GridCoverage2D fullCoverage = getCoverage(type, baseline.getId());
        try {
            SummaryModelConfig config = summaryModelConfigService.getConfig(baseline.getName(), type, model);
            return aggregateHeatmap(fullCoverage, config);
        } finally {
            fullCoverage.dispose(false);
        }
    }

    /**
     * Validates that the config contains step definitions and delegates to step-based aggregation.
     *
     * @param coverage source multi-band coverage
     * @param config   model configuration
     * @return aggregated heatmap coverage
     */
    GridCoverage2D aggregateHeatmap(GridCoverage2D coverage, SummaryModelConfig config) {
        if (config.getSteps() == null || config.getSteps().isEmpty()) {
            throw new IllegalArgumentException("Heatmap config must define steps");
        }
        return aggregateHeatmapBySteps(coverage, config);
    }

    /**
     * Executes all configured steps in order and materializes the selected output step as a {@link GridCoverage2D}.
     *
     * <p>Source bands are read in a single pass: every step that references source bands gets a pre-allocated
     * accumulator, and one walk over the source raster fills them all. This avoids re-decoding each row per step.
     * Steps are then finalized in {@code order}: input-only steps reference earlier results from the in-memory
     * map; non-output intermediates are released as soon as their remaining usage count reaches zero.</p>
     *
     * @param coverage source multi-band coverage
     * @param config   step-based model configuration
     * @return output heatmap coverage
     */
    GridCoverage2D aggregateHeatmapBySteps(GridCoverage2D coverage, SummaryModelConfig config) {
        List<SummaryModelConfig.Step> steps = new ArrayList<>(config.getSteps());
        steps.sort(Comparator.comparingInt(SummaryModelConfig.Step::getOrder));

        String outputStep = config.getOutputStep();
        if (outputStep == null || outputStep.isBlank()) {
            outputStep = steps.get(steps.size() - 1).getName();
        }

        RenderedImage source = coverage.getRenderedImage();
        int minX = source.getMinX();
        int minY = source.getMinY();
        int width = source.getWidth();
        int height = source.getHeight();
        int size = width * height;

        // Step name -> flattened raster values for completed steps.
        Map<String, float[]> results = new HashMap<>();
        // Remaining reference count for step outputs, used to release intermediates early.
        Map<String, Integer> remainingUsages = buildRemainingUsages(steps);

        // Pre-allocate accumulators for every step that reads source bands so a single pass
        // over the source raster fills them all.
        Map<String, StepAccumulator> sourceAccumulators = new HashMap<>();
        for (SummaryModelConfig.Step step : steps) {
            if (step.getBands() != null && !step.getBands().isEmpty()) {
                sourceAccumulators.put(step.getName(), createAccumulator(step, size));
            }
        }

        if (!sourceAccumulators.isEmpty()) {
            float[] rowBuffer = null;
            for (int y = 0; y < height; y++) {
                Raster rowRaster = source.getData(new Rectangle(minX, minY + y, width, 1));
                int rowOffset = y * width;
                for (SummaryModelConfig.Step step : steps) {
                    StepAccumulator acc = sourceAccumulators.get(step.getName());
                    if (acc == null) continue;
                    for (int band : step.getBands()) {
                        rowBuffer = rowRaster.getSamples(minX, minY + y, width, 1, band, rowBuffer);
                        aggregateSamplesWithOffset(acc.aggregated, acc.meanCounts, acc.hasValue,
                            rowBuffer, acc.operation, rowOffset);
                    }
                }
            }
        }

        for (SummaryModelConfig.Step step : steps) {
            StepAccumulator acc = sourceAccumulators.remove(step.getName());
            boolean hadBands = acc != null;
            if (acc == null) {
                acc = createAccumulator(step, size);
            }
            mergeInputs(acc, step, results);
            boolean hasInputs = step.getInputs() != null && !step.getInputs().isEmpty();
            if (!hadBands && !hasInputs) {
                throw new IllegalArgumentException("Step has no inputs or bands: " + step.getName());
            }
            float[] values = finalizeAggregation(acc.aggregated, acc.meanCounts, acc.hasValue, acc.operation);
            values = applyNormalization(values, step.getNormalization());
            results.put(step.getName(), values);
            releaseConsumedInputs(step, results, remainingUsages, outputStep);
        }

        final String resolvedOutputStep = outputStep;

        float[] output = results.get(resolvedOutputStep);
        if (output == null) {
            throw new IllegalArgumentException("Output step not found: " + resolvedOutputStep);
        }

        // Convert non-finite values to 0.0f in-place; the output array becomes the
        // DataBufferFloat backing buffer.
        for (int i = 0; i < size; i++) {
            if (!Float.isFinite(output[i])) {
                output[i] = 0.0f;
            }
        }
        SampleModel sampleModel = new BandedSampleModel(DataBuffer.TYPE_FLOAT, width, height, 1);
        DataBuffer dataBuffer = new DataBufferFloat(output, size);
        WritableRaster resultRaster = Raster.createWritableRaster(sampleModel, dataBuffer, null);

        GridCoverageFactory factory = new GridCoverageFactory();
        return factory.create("heatmap", resultRaster, coverage.getEnvelope());
    }

    /**
     * Counts how many times each step result is referenced by later steps.
     *
     * @param steps ordered/unordered step definitions
     * @return step-name usage counts
     */
    Map<String, Integer> buildRemainingUsages(List<SummaryModelConfig.Step> steps) {
        Map<String, Integer> usageCounts = new HashMap<>();
        for (SummaryModelConfig.Step step : steps) {
            if (step.getInputs() == null) {
                continue;
            }
            for (String inputName : step.getInputs()) {
                usageCounts.merge(inputName, 1, Integer::sum);
            }
        }
        return usageCounts;
    }

    /**
     * Decrements remaining usage counters for consumed inputs and releases their arrays when no longer needed.
     *
     * <p>The configured output step is never released, even when usage count reaches zero.</p>
     *
     * @param step            step currently being executed
     * @param results         in-memory step result storage
     * @param remainingUsages remaining consumer counts per step name
     * @param outputStep      selected final output step name
     */
    void releaseConsumedInputs(SummaryModelConfig.Step step,
                                       Map<String, float[]> results,
                                       Map<String, Integer> remainingUsages,
                                       String outputStep) {
        if (step.getInputs() == null || step.getInputs().isEmpty()) {
            return;
        }

        for (String inputName : step.getInputs()) {
            Integer remaining = remainingUsages.get(inputName);
            if (remaining == null) {
                continue;
            }
            int updatedRemaining = remaining - 1;
            if (updatedRemaining <= 0) {
                remainingUsages.remove(inputName);
                if (!outputStep.equals(inputName)) {
                    results.remove(inputName);
                }
            } else {
                remainingUsages.put(inputName, updatedRemaining);
            }
        }
    }

    /** Per-step aggregation state shared across the source-iteration and input-merge phases. */
    private record StepAccumulator(float[] aggregated, int[] meanCounts, boolean[] hasValue, Operation operation) {}

    private StepAccumulator createAccumulator(SummaryModelConfig.Step step, int size) {
        Operation operation = step.getOperation() != null ? step.getOperation() : Operation.MEAN;
        float[] aggregated = createAggregationBuffer(size, operation);
        int[] meanCounts = operation == Operation.MEAN ? new int[size] : null;
        boolean[] hasValue = (operation == Operation.MAX || operation == Operation.SUM) ? new boolean[size] : null;
        return new StepAccumulator(aggregated, meanCounts, hasValue, operation);
    }

    /**
     * Aggregates each of the step's referenced input results into the accumulator using the step's
     * operation. Inputs must already be present in {@code results} (guaranteed by ascending {@code order}).
     */
    private void mergeInputs(StepAccumulator acc, SummaryModelConfig.Step step, Map<String, float[]> results) {
        if (step.getInputs() == null || step.getInputs().isEmpty()) {
            return;
        }
        for (String inputName : step.getInputs()) {
            float[] input = results.get(inputName);
            if (input == null) {
                throw new IllegalArgumentException("Step input not found: " + inputName + " for step " + step.getName());
            }
            aggregateSamples(acc.aggregated, acc.meanCounts, acc.hasValue, input, acc.operation);
        }
    }

    /**
     * Allocates and initializes operation-specific aggregation buffers.
     *
     * @param size      flattened raster size
     * @param operation aggregation operation
     * @return operation-ready accumulator array
     */
    float[] createAggregationBuffer(int size, Operation operation) {
        return switch (operation) {
            case MAX -> {
                float[] maxes = new float[size];
                Arrays.fill(maxes, Float.NEGATIVE_INFINITY);
                yield maxes;
            }
            case MEAN, SUM -> new float[size];
        };
    }

    /**
     * Aggregates one row-sized sample array into the flattened accumulator at a row offset.
     *
     * @param accumulator output accumulator
     * @param meanCounts  per-pixel counters for {@code MEAN}
     * @param hasValue    per-pixel finite-value flags for {@code MAX}/{@code SUM}
     * @param samples     row samples
     * @param operation   aggregation operation
     * @param offset      row offset in flattened target array
     */
    void aggregateSamplesWithOffset(float[] accumulator,
                                            int[] meanCounts,
                                            boolean[] hasValue,
                                            float[] samples,
                                            Operation operation,
                                            int offset) {
        switch (operation) {
            case MAX -> aggregateMaxWithOffset(accumulator, hasValue, samples, offset);
            case MEAN -> aggregateMeanWithOffset(accumulator, meanCounts, samples, offset);
            case SUM -> aggregateSumWithOffset(accumulator, hasValue, samples, offset);
        }
    }

    /**
     * Aggregates a full flattened sample array into the flattened accumulator.
     *
     * @param accumulator output accumulator
     * @param meanCounts  per-pixel counters for {@code MEAN}
     * @param hasValue    per-pixel finite-value flags for {@code MAX}/{@code SUM}
     * @param samples     flattened samples
     * @param operation   aggregation operation
     */
    void aggregateSamples(float[] accumulator,
                                  int[] meanCounts,
                                  boolean[] hasValue,
                                  float[] samples,
                                  Operation operation) {
        switch (operation) {
            case MAX -> aggregateMax(accumulator, hasValue, samples);
            case MEAN -> aggregateMean(accumulator, meanCounts, samples);
            case SUM -> aggregateSum(accumulator, hasValue, samples);
        }
    }

    /**
     * Per-pixel max aggregation for row-based samples.
     */
    private void aggregateMaxWithOffset(float[] accumulator, boolean[] hasValue, float[] samples, int offset) {
        for (int i = 0; i < samples.length; i++) {
            float sample = samples[i];
            if (!Float.isFinite(sample)) {
                continue;
            }
            int targetIndex = offset + i;
            if (!hasValue[targetIndex] || sample > accumulator[targetIndex]) {
                accumulator[targetIndex] = sample;
            }
            hasValue[targetIndex] = true;
        }
    }

    /**
     * Per-pixel mean accumulation for row-based samples.
     */
    private void aggregateMeanWithOffset(float[] accumulator, int[] meanCounts, float[] samples, int offset) {
        for (int i = 0; i < samples.length; i++) {
            float sample = samples[i];
            if (!Float.isFinite(sample)) {
                continue;
            }
            int targetIndex = offset + i;
            accumulator[targetIndex] += sample;
            meanCounts[targetIndex]++;
        }
    }

    /**
     * Per-pixel sum aggregation for row-based samples.
     */
    private void aggregateSumWithOffset(float[] accumulator, boolean[] hasValue, float[] samples, int offset) {
        for (int i = 0; i < samples.length; i++) {
            float sample = samples[i];
            if (!Float.isFinite(sample)) {
                continue;
            }
            int targetIndex = offset + i;
            accumulator[targetIndex] += sample;
            hasValue[targetIndex] = true;
        }
    }

    /**
     * Per-pixel max aggregation for flattened input samples.
     */
    private void aggregateMax(float[] accumulator, boolean[] hasValue, float[] samples) {
        for (int i = 0; i < samples.length; i++) {
            float sample = samples[i];
            if (!Float.isFinite(sample)) {
                continue;
            }
            if (!hasValue[i] || sample > accumulator[i]) {
                accumulator[i] = sample;
            }
            hasValue[i] = true;
        }
    }

    /**
     * Per-pixel mean accumulation for flattened input samples.
     */
    private void aggregateMean(float[] accumulator, int[] meanCounts, float[] samples) {
        for (int i = 0; i < samples.length; i++) {
            float sample = samples[i];
            if (!Float.isFinite(sample)) {
                continue;
            }
            accumulator[i] += sample;
            meanCounts[i]++;
        }
    }

    /**
     * Per-pixel sum aggregation for flattened input samples.
     */
    private void aggregateSum(float[] accumulator, boolean[] hasValue, float[] samples) {
        for (int i = 0; i < samples.length; i++) {
            float sample = samples[i];
            if (!Float.isFinite(sample)) {
                continue;
            }
            accumulator[i] += sample;
            hasValue[i] = true;
        }
    }

    /**
     * Finalizes the accumulator by converting intermediate state into final step values.
     *
     * <ul>
     *   <li>{@code MEAN}: divide sums by counts; no samples => {@code NaN}</li>
     *   <li>{@code MAX}/{@code SUM}: pixels without finite samples => {@code NaN}</li>
     * </ul>
     *
     * @param accumulator intermediate accumulator
     * @param meanCounts  count buffer for mean operation
     * @param hasValue    finite-sample flags for max/sum operations
     * @param operation   operation being finalized
     * @return finalized values
     */
    float[] finalizeAggregation(float[] accumulator, int[] meanCounts, boolean[] hasValue, Operation operation) {
        for (int i = 0; i < accumulator.length; i++) {
            if (MEAN == operation) {
                if (meanCounts[i] == 0) {
                    accumulator[i] = Float.NaN;
                } else {
                    accumulator[i] = accumulator[i] / meanCounts[i];
                }
                continue;
            }

            if (!hasValue[i]) {
                accumulator[i] = Float.NaN;
            }
        }
        return accumulator;
    }

    /**
     * Applies optional per-step normalization.
     *
     * <p>Currently supports linear scaling from observed source bounds to configured target bounds.
     * If robust bounds are enabled, percentile-based source bounds are used instead of min/max.</p>
     *
     * @param values        step values to normalize in-place
     * @param normalization normalization configuration
     * @return normalized values (same array reference)
     */
    float[] applyNormalization(float[] values, SummaryModelConfig.Normalization normalization) {
        if (normalization == null) {
            return values;
        }

        String type = normalization.getType();
        if (!"linear".equalsIgnoreCase(type)) {
            return values;
        }

        double targetMin = normalization.getMin();
        double targetMax = normalization.getMax();
        if (!Double.isFinite(targetMin) || !Double.isFinite(targetMax) || (targetMax - targetMin) < 0.0001) {
            return values;
        }

        double valueMin = Double.POSITIVE_INFINITY;
        double valueMax = Double.NEGATIVE_INFINITY;
        for (float value : values) {
            if (!Float.isFinite(value)) {
                continue;
            }
            if (value < valueMin) {
                valueMin = value;
            }
            if (value > valueMax) {
                valueMax = value;
            }
        }

        SummaryModelConfig.RobustBounds robustBoundsConfig = normalization.getRobustBounds();
        boolean robustBoundsEnabled = robustBoundsConfig != null && robustBoundsConfig.isRobustBoundsEnabled();
        if (robustBoundsEnabled) {
            double lowPercentile = robustBoundsConfig.getLowPercentile() / 100.0;
            double highPercentile = robustBoundsConfig.getHighPercentile() / 100.0;
            // Use sampled percentile bounds to reduce outlier impact on linear stretching.
            float[] robustBounds = computeRobustBounds(values, lowPercentile, highPercentile, robustBoundsConfig.getMaxSamples());
            if (robustBounds != null) {
                valueMin = robustBounds[0];
                valueMax = robustBounds[1];
            }
        }

        if (!Double.isFinite(valueMin) || !Double.isFinite(valueMax) || (valueMax - valueMin) < 0.0001) {
            return values;
        }

        double targetRange = targetMax - targetMin;
        double sourceRange = valueMax - valueMin;

        for (int i = 0; i < values.length; i++) {
            float value = values[i];
            if (!Float.isFinite(value)) {
                continue;
            }

            // Clamp source value to [valueMin, valueMax] so outliers (relevant when robust
            // bounds are active) saturate at the target edges instead of mapping outside [targetMin, targetMax].
            double clamped = Math.max(valueMin, Math.min(valueMax, value));
            values[i] = (float) (targetMin + ((clamped - valueMin) / sourceRange) * targetRange);
        }

        return values;
    }


    /**
     * Computes robust low/high bounds using sampled finite values and percentile lookup.
     *
     * <p>The method sub-samples input values up to {@code maxSamples}, sorts sampled values,
     * and returns percentile indexes for low/high bounds.</p>
     *
     * @param values         source values
     * @param lowPercentile  lower percentile in [0..1]
     * @param highPercentile upper percentile in [0..1]
     * @param maxSamples     maximum sample size; non-positive means full length
     * @return two-element array {@code [low, high]} or {@code null} when robust bounds are not reliable
     */
    float[] computeRobustBounds(float[] values, double lowPercentile, double highPercentile, int maxSamples) {
        if (values == null || values.length == 0) {
            return null;
        }

        int samplingLimit = maxSamples > 0 ? maxSamples : values.length;
        int step = Math.max(1, (int) Math.ceil((double) values.length / samplingLimit));
        float[] sampledValues = new float[Math.max(1, values.length / step) + 1];
        int count = 0;

        for (int i = 0; i < values.length; i += step) {
            float value = values[i];
            if (!Float.isFinite(value)) {
                continue;
            }
            if (count >= sampledValues.length) {
                sampledValues = Arrays.copyOf(sampledValues, sampledValues.length * 2);
            }
            sampledValues[count++] = value;
        }

        if (count < 100) {
            return null;
        }

        Arrays.sort(sampledValues, 0, count);
        int lowIdx = Math.max(0, Math.min(count - 1, (int) Math.floor((count - 1) * lowPercentile)));
        int highIdx = Math.max(0, Math.min(count - 1, (int) Math.floor((count - 1) * highPercentile)));
        if (highIdx <= lowIdx) {
            return null;
        }

        float low = sampledValues[lowIdx];
        float high = sampledValues[highIdx];
        if (!Float.isFinite(low) || !Float.isFinite(high) || (high - low) < 0.0001) {
            return null;
        }

        return new float[]{low, high};
    }

    /**
     * Resolves data file path for a layer type and baseline.
     *
     * <p>Local development overrides are checked first. If no override is set,
     * file paths are read from the requested baseline version entity.</p>
     *
     * @param type              layer family
     * @param baselineVersionId baseline version identifier
     * @return absolute/relative file path to coverage source
     */
    String getComponentFilePath(LayerType type, int baselineVersionId) {
        String localDevFilePath = localDevFilePath(type);
        if (localDevFilePath != null) return localDevFilePath;
        BaselineVersion baselineVersion = baselineVersionService.getBaselineVersionById(baselineVersionId);
        String fileNameAndPath = null;
        if (LayerType.ECOSYSTEM.equals(type)) {
            fileNameAndPath = baselineVersion.getEcosystemsFilePath();
        } else if (LayerType.PRESSURE.equals(type)) {
            fileNameAndPath = baselineVersion.getPressuresFilePath();
        }
        return fileNameAndPath;
    }

    /**
     * Reads optional local-dev coverage file path overrides from properties.
     *
     * @param type layer family
     * @return configured local path or {@code null} when not configured
     */
    private String localDevFilePath(LayerType type) {
        String fileNameAndPath = null;
        if (LayerType.ECOSYSTEM.equals(type)) {
            fileNameAndPath = props.getProperty("data.localdev.ecosystems");
        } else if (LayerType.PRESSURE.equals(type)) {
            fileNameAndPath = props.getProperty("data.localdev.pressures");
        }
        return fileNameAndPath;
    }
}
