package se.havochvatten.symphony.service.normalizer;

import org.geotools.coverage.grid.GridCoverage2D;
import se.havochvatten.symphony.calculation.Operations;

class AreaNormalizer extends StatsNormalizer {
    AreaNormalizer(Operations ops) {
        super(ops);
    }

    @Override
    public Double apply(GridCoverage2D coverage, Double ignored) {
        return getExtrema(coverage, this.operations)[1];
    }
}
