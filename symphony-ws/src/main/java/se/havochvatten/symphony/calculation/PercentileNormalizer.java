package se.havochvatten.symphony.calculation;

import org.geotools.coverage.grid.GridCoverage2D;
import javax.media.jai.Histogram;

public class PercentileNormalizer extends RasterNormalizer {
    final static int NUM_BINS = 100; // More bins yields more accurate result

    private final int percentile;
    private final se.havochvatten.symphony.calculation.Operations operations;

    PercentileNormalizer(int nth, se.havochvatten.symphony.calculation.Operations ops) {
        this.percentile = nth;
        this.operations = ops;
    }

    @Override
    public Double apply(GridCoverage2D coverage, Double ignored) {
        return computeNthPercentileNormalizationValue(coverage);
    }

    public double computeNthPercentileNormalizationValue(GridCoverage2D coverage) {
        var extrema = (GridCoverage2D) operations.extrema(coverage);
        var histogram = operations.histogram(coverage, ((double[]) extrema.getProperty("minimum"))[0],
            ((double[]) extrema.getProperty("maximum"))[0], NUM_BINS);
        return getValueBelowPercentile(histogram);
    }

    private double getValueBelowPercentile(Histogram histogram) {
        final int RESULT_BAND = 0; // only one band in result

        double threshold = percentile / 100.0 * histogram.getTotals()[RESULT_BAND], accumulator = 0;
        int i;
        for (i = 0; i < histogram.getNumBins(RESULT_BAND) && accumulator < threshold; i++)
            accumulator += histogram.getBinSize(RESULT_BAND, i);

        // simple linear interpolation between last two bins:
        return (histogram.getBinLowValue(RESULT_BAND, i - 1) + histogram.getBinLowValue(RESULT_BAND, i)) / 2;
    }
}
