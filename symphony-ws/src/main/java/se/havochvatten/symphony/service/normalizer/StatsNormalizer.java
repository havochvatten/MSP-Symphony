package se.havochvatten.symphony.service.normalizer;

import it.geosolutions.jaiext.stats.Statistics;
import org.geotools.coverage.grid.GridCoverage2D;
import se.havochvatten.symphony.calculation.Operations;

public abstract class StatsNormalizer extends RasterNormalizer {
    protected Operations operations;

    public StatsNormalizer(Operations ops) {
        this.operations = ops;
    }

    public static double[] getExtrema(GridCoverage2D coverage, Operations operations) {
        return (double[]) ((Statistics[][])
            ((GridCoverage2D) operations.extrema(coverage)).getProperty(Statistics.STATS_PROPERTY))[0][0].getResult();
    }
}
