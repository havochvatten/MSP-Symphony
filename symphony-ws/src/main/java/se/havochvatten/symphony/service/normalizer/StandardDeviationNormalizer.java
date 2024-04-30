package se.havochvatten.symphony.service.normalizer;

import it.geosolutions.jaiext.stats.Statistics;
import org.geotools.coverage.grid.GridCoverage2D;
import se.havochvatten.symphony.calculation.Operations;

class StandardDeviationNormalizer extends StatsNormalizer {
    StandardDeviationNormalizer(Operations ops) {
        super(ops);
    }

    @Override
    public Double apply(GridCoverage2D coverage, Double multiplier) {

        Statistics[] stats = operations.stats(coverage, new int[]{0}, new Statistics.StatsType[]{
            Statistics.StatsType.MEAN, Statistics.StatsType.DEV_STD})[0];

        double mean = (double) stats[0].getResult(),
            stdDev = (double) stats[1].getResult();

        return Math.max(mean + stdDev * multiplier, 0);
    }
}
