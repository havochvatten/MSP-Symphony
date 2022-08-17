package se.havochvatten.symphony.calculation;

import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.processing.CoverageProcessor;
import org.geotools.coverage.processing.OperationJAI;
import org.geotools.util.factory.Hints;
import se.havochvatten.symphony.calculation.jai.CIA.CumulativeImpactDescriptor;
import se.havochvatten.symphony.calculation.jai.rescale2.Rescale2Descriptor;

import javax.ejb.Singleton;
import javax.media.jai.ImageLayout;
import javax.media.jai.JAI;
import javax.media.jai.ROI;
import java.awt.image.DataBuffer;

@Singleton
public class SymphonyCoverageProcessor extends CoverageProcessor {
    public SymphonyCoverageProcessor() {
        super();
        addOperation(new OperationJAI(new Rescale2Descriptor()));
        addOperation(new OperationJAI(new CumulativeImpactDescriptor()));
//        addOperation(new OperationJAI(new RarityAdjustedCumulativeImpactDescriptor()));
        addOperation(new OperationJAI("Subtract"));
        addOperation(new OperationJAI("Divide"));
        addOperation(new OperationJAI("Stats"));
    }

    /**
     * Wrapper of HaV rescale JAI op
     */
    public GridCoverage2D rescaleCoverage(GridCoverage2D source, double[] constants, double[] offsets,
                                          ROI roi) {
        // Pass in ImageLayout?
        final var rescale = this.getOperation("se.havochvatten.symphony.Rescale");

        var params = rescale.getParameters();
        params.parameter("Source").setValue(source);
        params.parameter("constants").setValue(constants);
        params.parameter("offsets").setValue(offsets);
        params.parameter("ROI").setValue(roi);

        ImageLayout destLayout = new ImageLayout();
        destLayout.setSampleModel(CalcUtil.createSampleModel(DataBuffer.TYPE_USHORT,
                source.getRenderedImage().getSampleModel()));

        Hints hints = new Hints(JAI.KEY_IMAGE_LAYOUT, destLayout);
        return (GridCoverage2D) this.doOperation(params, hints);
    }
}
