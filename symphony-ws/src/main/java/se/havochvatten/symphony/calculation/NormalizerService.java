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
                return new PercentileNormalizer(Integer.parseInt(
                    props.getProperty("calc.normalization.histogram.percentile")));
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

