package se.havochvatten.symphony.calculation;

import it.geosolutions.jaiext.range.Range;
import it.geosolutions.jaiext.range.RangeFactory;
import it.geosolutions.jaiext.stats.HistogramMode;
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
import se.havochvatten.symphony.calculation.jai.CIA.CumulativeImpactOp;
import se.havochvatten.symphony.calculation.jai.CIA.RarityAdjustedCumulativeImpactDescriptor;
import se.havochvatten.symphony.calculation.jai.rescale2.Rescale2Descriptor;
import se.havochvatten.symphony.dto.LayerType;

import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
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
    private final SymphonyCoverageProcessor processor;

    private final Range defaultNoDataRange =
        RangeFactory.create(CumulativeImpactOp.NODATA_VALUE, false, CumulativeImpactOp.NODATA_VALUE, true);


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
                             double[] offsets, ROI roi, double maxClamp, LayerType category)
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

    /** Min/max jai-ext stats op for a single band, assuming default "NoData"-range */
    @Override
    public Coverage extrema(Coverage source) throws CoverageProcessingException {
        return _stats(  source,
                        new int[]{0},
                        new Statistics.StatsType[]{ Statistics.StatsType.EXTREMA },
                        defaultNoDataRange);
    }

    private Coverage _stats(final Coverage source, int[] bands, Statistics.StatsType[] stats, Range noData){
        final var statsOp = processor.getOperation("Stats");
        var params = statsOp.getParameters();
        params.parameter("source").setValue(source);
        params.parameter("bands").setValue(bands);
        params.parameter("noData").setValue(noData);
        params.parameter("stats").setValue(stats);
       return processor.doOperation(params);
    }

    public Statistics[][] stats(final Coverage source, int[] bands, Statistics.StatsType[] stats)
        throws CoverageProcessingException {
        return (Statistics[][]) ((GridCoverage2D) _stats(source, bands, stats, defaultNoDataRange)).getProperty(Statistics.STATS_PROPERTY);
    }

    /**
     * Zonal statistics for a single feature
     */
    public ZoneGeometry zonalStats(final Coverage source, int[] bands, Statistics.StatsType[] stats, List<SimpleFeature> zoneList)
        throws CoverageProcessingException {
        final var statsOp = processor.getOperation("Zonal");

        var params = statsOp.getParameters();
        params.parameter("source").setValue(source);
        params.parameter("bands").setValue(bands);
        params.parameter("stats").setValue(stats);
        // Perhaps use RasterZonalStatistics if its faster?
        params.parameter("roilist").setValue(zoneList);
        var result = (GridCoverage2D) processor.doOperation(params);
        var zoneStats = (List<ZoneGeometry>) result.getProperty(ZonalStatsDescriptor.ZS_PROPERTY);
        return zoneStats.get(0);
    }

    /** Computes a histogram for a single band */
    /** TODO: Investigate utilization of it.geosolutions.jaiext.stats.HistogramWrapper for
     *        access to useful helper methods that javax.media.jai.Histogram defines      */
    public HistogramMode histogram(final Coverage source, double lowValue, double highValue, int numBins, Range noData)
        throws CoverageProcessingException  {
        processor.getOperation("histogram");

        final var statsOp = processor.getOperation("Stats");

        ParameterValueGroup param = statsOp.getParameters();
        param.parameter("Source").setValue(source);
        param.parameter("stats").setValue(
            new Statistics.StatsType[]{
                Statistics.StatsType.HISTOGRAM
            }
        );
        param.parameter("lowValue").setValue(new double[]{lowValue});
        param.parameter("highValue").setValue(new double[]{highValue});
        param.parameter("numBins").setValue(new int[]{numBins});
        param.parameter("noData").setValue(noData);
        var result = (GridCoverage2D) processor.doOperation(param);

        return (HistogramMode) ((Statistics[][]) result.getProperty(Statistics.STATS_PROPERTY))[0][0];
    }

    public HistogramMode histogram(final Coverage source, double lowValue, double highValue, int numBins) {
        return histogram(source, lowValue, highValue, numBins, defaultNoDataRange);
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

