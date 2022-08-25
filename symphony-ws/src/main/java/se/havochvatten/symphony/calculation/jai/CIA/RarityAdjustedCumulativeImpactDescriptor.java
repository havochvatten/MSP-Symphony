package se.havochvatten.symphony.calculation.jai.CIA;

import javax.media.jai.ImageLayout;
import javax.media.jai.JAI;
import javax.media.jai.OperationDescriptorImpl;
import javax.media.jai.RasterFactory;
import javax.media.jai.registry.RenderedRegistryMode;
import java.awt.*;
import java.awt.image.DataBuffer;
import java.awt.image.Raster;
import java.awt.image.RenderedImage;
import java.awt.image.renderable.ParameterBlock;
import java.awt.image.renderable.RenderedImageFactory;

public class RarityAdjustedCumulativeImpactDescriptor extends OperationDescriptorImpl implements RenderedImageFactory {

    /**
     * The resource strings that specify the parameter list for this operation.
     */
    private static final String[][] resources = {
            {"GlobalName", "se.havochvatten.symphony.RarityAdjustedCumulativeImpact"},
            {"LocalName", "RarityAdjustedCumulativeImpact"},
            {"Vendor", "it.geosolutions.jaiext"},
            {"Description", "Global rarity index-adjusted Cumulative Impact Assessment Calculation"},
            {"DocURL", ""},
            {"Version", "1.0"},
            {"arg0Desc", "sensitivity matrices array"},
            {"arg1Desc", "matrix mask"},
            {"arg2Desc", "ecosystem services bands to include"},
            {"arg3Desc", "pressure bands to include"},
            {"arg4Desc", "per-band commonness indices array"}
    };

    /**
     * The parameter class list
     */
    protected static final Class[] paramClasses = {
        double[][][].class, // FIXME use floats instead
        Raster.class,
        int[].class,
        int[].class,
        double[].class
    };

    /**
     * The parameter name list
     */
    protected static final String[] paramNames = {"matrix", "mask", "ecosystemBands", "pressureBands", "commonnessIndices"};

    /**
     * The parameter default value list for this operation.
     */
    protected static final Object[] paramDefaults = {
            NO_PARAMETER_DEFAULT, NO_PARAMETER_DEFAULT, NO_PARAMETER_DEFAULT, NO_PARAMETER_DEFAULT, NO_PARAMETER_DEFAULT
    };

    protected static final String[] supportedModes = {RenderedRegistryMode.MODE_NAME};

    /**
     * Constructor.
     */
    public RarityAdjustedCumulativeImpactDescriptor() {
        super(resources, supportedModes, 2, paramNames, paramClasses, paramDefaults, null);
    }

    @Override
    public RenderedImage create(ParameterBlock pb, RenderingHints hints) {
        RenderedImage source0 = pb.getRenderedSource(0);

        ImageLayout layout = (ImageLayout) hints.get(JAI.KEY_IMAGE_LAYOUT); // get dimensions from hint
        // Just use new SampleModel??
        layout.setSampleModel(RasterFactory.createComponentSampleModel(
                source0.getSampleModel(),
                DataBuffer.TYPE_DOUBLE, layout.getWidth(null), layout.getHeight(null), 1));

        RenderedImage source1 = pb.getRenderedSource(1);

        // Selection of the parameters
        double[][][] matrices = (double[][][]) pb.getObjectParameter(0);
        var mask = (Raster) pb.getObjectParameter(1);
        int[] ecosystems = (int[]) pb.getObjectParameter(2);
        int[] pressures = (int[]) pb.getObjectParameter(3);
        var commonnessIndices = (double[]) pb.getObjectParameter(4);

        return new RarityAdjustedCumulativeImpactOp(source0, source1, layout, hints,
                matrices, mask, ecosystems, pressures, commonnessIndices);
    }

    /**
     * Validates the input source and parameters.
     */
    @Override
    public boolean validateArguments(String modeName, ParameterBlock args, StringBuffer message) {
        if (!super.validateArguments(modeName, args, message))
            return false;

        var commonnessIndices = (double[]) args.getObjectParameter(4);
        int[] ecosystems = (int[]) args.getObjectParameter(2);
        if (commonnessIndices != null && commonnessIndices.length != ecosystems.length) {
            message.append(getName() + ": " + "number of commonness indices does not match number of ecosystems services");
            return false;
        }

        return true;
    }
}
