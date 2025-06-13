package se.havochvatten.symphony.service.normalizer;

import se.havochvatten.symphony.calculation.Operations;
import se.havochvatten.symphony.dto.NormalizationType;
import se.havochvatten.symphony.service.PropertiesService;

import jakarta.ejb.Singleton;
import jakarta.inject.Inject;

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

    public Operations getOperations() {
        return operations;
    }

    public NormalizerService() { this.operations = null; } // to satisfy CDI

    // Call this from Jackson handle this?
    public RasterNormalizer getNormalizer(NormalizationType type) {
        switch (type) {
            case AREA:
                return new AreaNormalizer(operations);
            case DOMAIN:
                return new DomainNormalizer();
            case STANDARD_DEVIATION:
                return new StandardDeviationNormalizer(operations);
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


