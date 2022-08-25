package se.havochvatten.symphony.calculation;

import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.processing.OperationJAI;
import org.geotools.coverage.processing.Operations;
import org.opengis.parameter.ParameterValueGroup;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.dto.NormalizationType;
import se.havochvatten.symphony.service.PropertiesService;

import javax.ejb.Singleton;
import javax.inject.Inject;
import javax.media.jai.Histogram;
import java.util.function.BiFunction;

@Singleton
public class NormalizerService {
    @Inject
    private PropertiesService props;

    // Call this from Jackson handle this?
    public RasterNormalizer getNormalizer(NormalizationType type) {
        switch (type) {
            case AREA:
                return new AreaNormalizer();
            case DOMAIN:
                return new DomainNormalizer();
            case USER_DEFINED:
                return new UserDefinedValueNormalizer();
            case PERCENTILE:
                return new PercentileNormalizer(Integer.parseInt(props.getProperty("calc.normalization" +
                        ".histogram.percentile")));
            default:
                throw new RuntimeException("Unknown normalizer type: " + type);
        }
    }
}

abstract class RasterNormalizer implements BiFunction<GridCoverage2D, Double, Double> {
    protected static final Logger LOG = LoggerFactory.getLogger(RasterNormalizer.class);

    /**
     * Default normalization, just use supplied value
     **/
    @Override
    public Double apply(GridCoverage2D coverage, Double normalizationValue) {
        return normalizationValue;
    }
}

class AreaNormalizer extends RasterNormalizer {
    @Override
    public Double apply(GridCoverage2D coverage, Double ignored) {
        var extrema = (GridCoverage2D) Operations.DEFAULT.extrema(coverage);
        return ((double[]) extrema.getProperty("maximum"))[0];
    }
}

class DomainNormalizer extends RasterNormalizer {}

class UserDefinedValueNormalizer extends RasterNormalizer {}

class PercentileNormalizer extends RasterNormalizer {
    final static int NUM_BINS = 100; // More bins yields more accurate result

    private final int percentile;

    PercentileNormalizer(int nth) {
        this.percentile = nth;
    }

    @Override
    public Double apply(GridCoverage2D coverage, Double ignored) {
        var extrema = (GridCoverage2D) Operations.DEFAULT.extrema(coverage);
        var histogram = getHistogram(coverage, ((double[]) extrema.getProperty("minimum"))[0],
                ((double[]) extrema.getProperty("maximum"))[0]);
        return getValueBelowPercentile(histogram);
    }

    public double computeNthPercentileNormalizationValue(GridCoverage2D coverage) {
        var extrema = (GridCoverage2D) Operations.DEFAULT.extrema(coverage);
        var histogram = getHistogram(coverage, ((double[]) extrema.getProperty("minimum"))[0],
            ((double[]) extrema.getProperty("maximum"))[0]);
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
    private static Histogram getHistogram(GridCoverage2D coverage, double lowValue, double maxValue) {
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
        param.parameter("numBins").setValue(new int[]{NUM_BINS});
        var cov = (GridCoverage2D) op.doOperation(param, null);

        return (Histogram) cov.getProperty("histogram");
    }
}
