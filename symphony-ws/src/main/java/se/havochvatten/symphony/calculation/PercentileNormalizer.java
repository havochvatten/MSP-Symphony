package se.havochvatten.symphony.calculation;

import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.processing.OperationJAI;
import org.geotools.coverage.processing.Operations;
import org.opengis.parameter.ParameterValueGroup;

import javax.media.jai.Histogram;

public class PercentileNormalizer extends RasterNormalizer {
    final static int NUM_BINS = 100; // More bins yields more accurate result

    private final int percentile;

    PercentileNormalizer(int nth) {
        this.percentile = nth;
    }

    @Override
    public Double apply(GridCoverage2D coverage, Double ignored) {
        var extrema = (GridCoverage2D) Operations.DEFAULT.extrema(coverage);
        var histogram = getHistogram(coverage, ((double[]) extrema.getProperty("minimum"))[0],
            ((double[]) extrema.getProperty("maximum"))[0], NUM_BINS);
        return getValueBelowPercentile(histogram);
    }

    public double computeNthPercentileNormalizationValue(GridCoverage2D coverage) {
        var extrema = (GridCoverage2D) Operations.DEFAULT.extrema(coverage);
        var histogram = getHistogram(coverage, ((double[]) extrema.getProperty("minimum"))[0],
            ((double[]) extrema.getProperty("maximum"))[0], NUM_BINS);
        var normalizationValue = getValueBelowPercentile(histogram);
        return normalizationValue;
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

    /**
     * Compute histogram using (wrapped) JAI op
     */
    public static Histogram getHistogram(GridCoverage2D coverage, double lowValue, double maxValue, int numBins) {
        final OperationJAI op = new OperationJAI("Histogram");

        ParameterValueGroup param = op.getParameters();
        param.parameter("Source").setValue(coverage);
        // CalcEngine.NO_DATA (NaN) is handled appropriately no ROI not needed:
        //                var geom = (Geometry)coverage.getProperty("roi");
        //                var shape = new LiteShape(geom,
        //                        (AffineTransform)coverage.getGridGeometry().toCanonical().getCRSToGrid2D
        //                        (), false);
        //                param.parameter("roi").setValue(new ROIShape(shape));
        param.parameter("lowValue").setValue(new double[]{lowValue});
        param.parameter("highValue").setValue(new double[]{maxValue});
        param.parameter("numBins").setValue(new int[]{numBins});
        var cov = (GridCoverage2D) op.doOperation(param, null);

        return (Histogram) cov.getProperty("histogram");
    }
}
