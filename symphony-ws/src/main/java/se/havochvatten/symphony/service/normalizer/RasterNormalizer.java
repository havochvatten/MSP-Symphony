package se.havochvatten.symphony.service.normalizer;

import org.geotools.coverage.grid.GridCoverage2D;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.function.BiFunction;

public abstract class RasterNormalizer implements BiFunction<GridCoverage2D, Double, Double> {
    protected static final Logger LOG = LoggerFactory.getLogger(RasterNormalizer.class);

    /**
     * Default normalization, just use supplied value
     **/
    @Override
    public Double apply(GridCoverage2D coverage, Double normalizationValue) {
        return normalizationValue;
    }
}
