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

public class CumulativeImpactDescriptor extends OperationDescriptorImpl implements RenderedImageFactory {

    /**
     * The resource strings that specify the parameter list for this operation.
     */
    private static final String[][] resources = {
            {"GlobalName", "se.havochvatten.CumulativeImpact"},
            {"LocalName", "CumulativeImpact"},
            {"Vendor", "it.geosolutions.jaiext"},
            {"Description", "Symphony Cumulative Impact Assessment Sum"},
            {"DocURL", ""},
            {"Version", "1.0"},
            {"arg0Desc", "sensitivity matrices array"},
            {"arg1Desc", "matrix mask"},
            {"arg2Desc", "ecosystem services bands to include"},
            {"arg3Desc", "pressure bands to include"},
    };

    /**
     * The parameter class list
     */
    protected static final Class[] paramClasses = {
            double[][][].class, // FIXME use floats instead
            Raster.class,
            int[].class,
            int[].class
    };

    /**
     * The parameter name list
     */
    protected static final String[] paramNames = {"matrix", "mask", "ecosystemBands", "pressureBands"};

    /**
     * The parameter default value list for this operation.
     */
    protected static final Object[] paramDefaults = {
            NO_PARAMETER_DEFAULT, NO_PARAMETER_DEFAULT, NO_PARAMETER_DEFAULT, NO_PARAMETER_DEFAULT,
    };

    protected static final String[] supportedModes = {RenderedRegistryMode.MODE_NAME};

    /**
     * Constructor.
     */
    public CumulativeImpactDescriptor() {
        super(resources, supportedModes, 2, paramNames, paramClasses, paramDefaults, null);
    }

    @Override
    public RenderedImage create(ParameterBlock pb, RenderingHints hints) {
        RenderedImage source0 = pb.getRenderedSource(0);

        ImageLayout layout = (ImageLayout) hints.get(JAI.KEY_IMAGE_LAYOUT); // get dimensions from hint
        // Just use new SampleModel??
        layout.setSampleModel(RasterFactory.createComponentSampleModel(
                source0.getSampleModel(),
                DataBuffer.TYPE_INT, layout.getWidth(null), layout.getHeight(null), 1));

        RenderedImage source1 = pb.getRenderedSource(1);

        // Selection of the parameters
        double[][][] matrices = (double[][][]) pb.getObjectParameter(0);
        var mask = (Raster) pb.getObjectParameter(1);
        int[] ecosystems = (int[]) pb.getObjectParameter(2);
        int[] pressures = (int[]) pb.getObjectParameter(3);

        return new CumulativeImpactOp(source0, source1, layout, hints,
                matrices, mask, ecosystems, pressures);
    }

    /**
     * Validates the input source and parameters.
     */
    @Override
    public boolean validateArguments(String modeName, ParameterBlock args, StringBuffer message) {
        if (!super.validateArguments(modeName, args, message))
            return false;

        // Verify matrix dimensions
        RenderedImage ecoservices = args.getRenderedSource(0);
        RenderedImage pressures = args.getRenderedSource(1);

        double[][][] matrices = (double[][][]) args.getObjectParameter(0);
        var matrix = matrices[1]; // pick first non-empty matrix
        // TODO check all matrices

        if (pressures.getSampleModel().getNumBands() != matrix.length) {
            message.append(getName() + ": " + "numbers of rows in matrix does not match number of pressures");
            return false;
        }
        for (int i = 0; i < matrix.length; i++) {
            if (matrix[i].length != ecoservices.getSampleModel().getNumBands()) {
                message.append(getName() + ": " + "numbers of columns in matrix does not match number of ecosystem services in row " + i);
                return false;
            }
        }

        // TODO verify mask? (right image layout etc)
        return true;
    }
}