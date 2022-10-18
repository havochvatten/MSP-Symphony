package se.havochvatten.symphony.calculation;

import org.geotools.coverage.grid.GridCoverage2D;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.dto.NormalizationType;
import se.havochvatten.symphony.service.PropertiesService;

import javax.ejb.Singleton;
import javax.inject.Inject;
import java.util.function.BiFunction;

@Singleton
public class NormalizerService {
    @Inject
    private PropertiesService props;

    @Inject
    private Operations operations;

    @Inject
    public NormalizerService(se.havochvatten.symphony.calculation.Operations operations) {
        this.operations = operations;
    }

    public NormalizerService() { this.operations = null; } // to satisfy CDI

    // Call this from Jackson handle this?
    public RasterNormalizer getNormalizer(NormalizationType type) {
        switch (type) {
            case AREA:
                return new AreaNormalizer(operations);
            case DOMAIN:
                return new DomainNormalizer();
            case USER_DEFINED:
                return new UserDefinedValueNormalizer();
            case PERCENTILE:
                var prop = props.getProperty("calc.normalization.histogram.percentile");
                if (prop == null)
                    throw new RuntimeException("No percentile valued set in properties");
                return new PercentileNormalizer(Integer.parseInt(prop), operations);
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
    Operations operations;

    AreaNormalizer(Operations ops) { this.operations = ops; }

    @Override
    public Double apply(GridCoverage2D coverage, Double ignored) {
        var extrema = (GridCoverage2D) operations.extrema(coverage);
        return ((double[]) extrema.getProperty("maximum"))[0];
    }
}

class DomainNormalizer extends RasterNormalizer {}

class UserDefinedValueNormalizer extends RasterNormalizer {}
