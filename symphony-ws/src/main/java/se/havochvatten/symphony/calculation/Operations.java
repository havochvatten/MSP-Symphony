package se.havochvatten.symphony.calculation;

import it.geosolutions.jaiext.stats.Statistics;
import it.geosolutions.jaiext.zonal.ZonalStatsDescriptor;
import it.geosolutions.jaiext.zonal.ZoneGeometry;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.processing.CoverageProcessingException;
import org.geotools.coverage.processing.CoverageProcessor;
import org.geotools.coverage.processing.OperationJAI;
import org.geotools.util.factory.Hints;
import org.opengis.coverage.Coverage;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.parameter.ParameterValueGroup;
import se.havochvatten.symphony.calculation.jai.CIA.CumulativeImpactDescriptor;
import se.havochvatten.symphony.calculation.jai.CIA.RarityAdjustedCumulativeImpactDescriptor;
import se.havochvatten.symphony.calculation.jai.rescale2.Rescale2Descriptor;

import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.media.jai.*;
import java.util.List;

class SymphonyCoverageProcessor extends CoverageProcessor {
    public SymphonyCoverageProcessor() {
        super();
        addOperation(new OperationJAI(new Rescale2Descriptor()));
        addOperation(new OperationJAI(new CumulativeImpactDescriptor()));
        addOperation(new OperationJAI(new RarityAdjustedCumulativeImpactDescriptor()));
        addOperation(new OperationJAI("Subtract"));
        addOperation(new OperationJAI("Divide"));
        addOperation(new OperationJAI("Stats"));
    }
}

@Startup
@Singleton
public class Operations extends org.geotools.coverage.processing.Operations {

    /* Additional coverage processor since it's currently not possible to add operation to the default instance */
    private SymphonyCoverageProcessor processor;

//    @PostConstruct
//    void init() {
//    }

    public Operations() {
        super(null);
        this.processor = new SymphonyCoverageProcessor();
    }

    public Coverage subtract(final Coverage source0, final Coverage source1)
        throws CoverageProcessingException {
        final var subtract = processor.getOperation("Subtract");
        var params = subtract.getParameters();
        params.parameter("Source0").setValue(source0);
        params.parameter("Source1").setValue(source1);
        return processor.doOperation(params);
    }

    public Coverage divide(final Coverage source0, final Coverage source1)
        throws CoverageProcessingException {
        final var subtract = processor.getOperation("Divide");
        var params = subtract.getParameters();
        params.parameter("Source0").setValue(source0);
        params.parameter("Source1").setValue(source1);
        return processor.doOperation(params);
    }

    // Forked version of JAI-Ext's rescale operation with some extra functionality
    public Coverage rescale(final Coverage source, double[] constants,
                            double[] offsets, ROI roi, double maxClamp)
        throws CoverageProcessingException {
        final var rescale = processor.getOperation("se.havochvatten.symphony.Rescale");

        var params = rescale.getParameters();
        params.parameter("Source").setValue(source);
        params.parameter("constants").setValue(constants);
        params.parameter("offsets").setValue(offsets);
        params.parameter("ROI").setValue(roi);
        params.parameter("clamp").setValue(maxClamp);

        return processor.doOperation(params);
    }

    public Statistics[][] stats(final Coverage source, int[] bands, Statistics.StatsType[] stats)
        throws CoverageProcessingException {
        final var statsOp = processor.getOperation("Stats");

        var params = statsOp.getParameters();
        params.parameter("source").setValue(source);
        params.parameter("bands").setValue(bands);
        params.parameter("stats").setValue(stats);
        var result = (GridCoverage2D) processor.doOperation(params);
        return (Statistics[][]) result.getProperty(Statistics.STATS_PROPERTY);
    }

    /**
     * Zonal statistics for a single feature
     */
    public ZoneGeometry zonalStats(final Coverage source, int[] bands, Statistics.StatsType[] stats, SimpleFeature roi)
        throws CoverageProcessingException {
        final var statsOp = processor.getOperation("Zonal");

        var params = statsOp.getParameters();
        params.parameter("source").setValue(source);
        params.parameter("bands").setValue(bands);
        params.parameter("stats").setValue(stats);
        // Perhaps use RasterZonalStatistics if its faster?
        params.parameter("roilist").setValue(List.of(roi));
        var result = (GridCoverage2D) processor.doOperation(params);
        var zoneStats = (List<ZoneGeometry>) result.getProperty(ZonalStatsDescriptor.ZS_PROPERTY);
        return zoneStats.get(0);
    }

    /** Computes a histogram for a single band */
    public Histogram histogram(final Coverage source, double lowValue, double highValue, int numBins)
        throws CoverageProcessingException  {
        final var op = processor.getOperation("histogram");

        ParameterValueGroup param = op.getParameters();
        param.parameter("Source").setValue(source);
        // CalcEngine.NO_DATA (NaN) is handled appropriately no ROI not needed:
        //                var geom = (Geometry)coverage.getProperty("roi");
        //                var shape = new LiteShape(geom,
        //                        (AffineTransform)coverage.getGridGeometry().toCanonical().getCRSToGrid2D
        //                        (), false);
        //                param.parameter("roi").setValue(new ROIShape(shape));
        param.parameter("lowValue").setValue(new double[]{lowValue});
        param.parameter("highValue").setValue(new double[]{highValue});
        param.parameter("numBins").setValue(new int[]{numBins});
        var result = (GridCoverage2D) processor.doOperation(param, null);
        return (Histogram) result.getProperty("histogram");
    }

    public GridCoverage2D cumulativeImpact(String operationName, GridCoverage2D ecoComponents, GridCoverage2D pressures,
                                           int[] actualEcosystemsToBeIncluded,
                                           int[] pressuresToInclude,
                                           double[][][] matrices,
                                           ImageLayout layout, MatrixMask mask,
                                           double[] commonness) {
        var op = processor.getOperation(
            String.join(".", "se.havochvatten.symphony", operationName));

        var params = op.getParameters();
        params.parameter("Source0").setValue(ecoComponents);
        params.parameter("Source1").setValue(pressures);
        params.parameter("matrix").setValue(matrices);
        params.parameter("mask").setValue(mask.getRaster());
        params.parameter("ecosystemBands").setValue(actualEcosystemsToBeIncluded);
        params.parameter("pressureBands").setValue(pressuresToInclude);
        if (commonness != null)
            params.parameter("commonnessIndices").setValue(commonness);

        return (GridCoverage2D) processor.doOperation(params, new Hints(JAI.KEY_IMAGE_LAYOUT, layout));
    }
}

