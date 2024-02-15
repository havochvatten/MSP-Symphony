package se.havochvatten.symphony.service.normalizer;

import it.geosolutions.jaiext.stats.HistogramMode;
import it.geosolutions.jaiext.stats.Statistics;
import org.geotools.coverage.grid.GridCoverage2D;
import se.havochvatten.symphony.service.normalizer.RasterNormalizer;

import java.util.Arrays;

public class PercentileNormalizer extends RasterNormalizer {
    final static int NUM_BINS = 100; // More bins yields more accurate result

    private final int percentile;
    private final se.havochvatten.symphony.calculation.Operations operations;

    public PercentileNormalizer(int nth, se.havochvatten.symphony.calculation.Operations ops) {
        this.percentile = nth;
        this.operations = ops;
    }

    @Override
    public Double apply(GridCoverage2D coverage, Double ignored) {
        return computeNthPercentileNormalizationValue(coverage);
    }

    public double computeNthPercentileNormalizationValue(GridCoverage2D coverage) {

        double[] extrema = (double[]) ((Statistics[][])
            ((GridCoverage2D) operations.extrema(coverage)).getProperty(Statistics.STATS_PROPERTY))[0][0].getResult();
        double max = extrema[1] + (Math.ulp(extrema[1]) * 100);

        HistogramMode histogram = operations.histogram(coverage, 0.0, max, NUM_BINS);
        double[] bins = (double[]) histogram.getResult();

        double binSize = max / 100,
            total = Arrays.stream(bins).reduce(0.0, Double::sum),
            threshold = percentile / 100.0 * total, accumulator = 0;

        int i;
        for (i = 0; i < NUM_BINS && accumulator < threshold; i++)
            accumulator += bins[i];

        // simple linear interpolation between last two bins (middle value)
        return binSize * i + binSize * 0.5;
    }
}
