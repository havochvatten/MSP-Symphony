package se.havochvatten.symphony.calculation.jai.CIA;

import javax.media.jai.ImageLayout;
import javax.media.jai.RasterAccessor;
import javax.media.jai.RasterFormatTag;
import java.awt.*;
import java.awt.image.DataBuffer;
import java.awt.image.Raster;
import java.awt.image.RenderedImage;
import java.awt.image.WritableRaster;
import java.util.Map;
import java.util.logging.Logger;

public class RarityAdjustedCumulativeImpactOp extends CumulativeImpactOp {
    private static final Logger LOG = Logger.getLogger(RarityAdjustedCumulativeImpactOp.class.getName());

    private final double[] commonnessIndices;
    private final double[][] impactMatrix;

    public RarityAdjustedCumulativeImpactOp(RenderedImage ecosystemsData, RenderedImage pressuresData,
                                            ImageLayout layout, Map config, double[][][] matrices, Raster mask,
                                            int[] ecosystems, int[] pressures, double[] commonnessIndices) {
        super(ecosystemsData, pressuresData, layout, config, matrices, mask, ecosystems, pressures);
        this.commonnessIndices = commonnessIndices;
        this.impactMatrix = new double[pressureBands.length][ecosystemBands.length];
    }

    @Override
    protected void computeRect(Raster[] sources, WritableRaster dst, Rectangle dstRect) {
        LOG.fine("computeRect: " + dstRect + ", thread=" + Thread.currentThread().getId());

        RasterFormatTag[] formatTags = getFormatTags();
        Rectangle srcRect = mapDestRect(dstRect, 0);

        // FIXME do away with raster accessors for source, instead use sources[x].getTile
        RasterAccessor ecoAccessor = new RasterAccessor(sources[0], srcRect, formatTags[0],
            getSourceImage(0).getColorModel());
        RasterAccessor presAccessor = new RasterAccessor(sources[1], srcRect, formatTags[1],
            getSourceImage(1).getColorModel());
        RasterAccessor dstAccessor = new RasterAccessor(dst, dstRect, formatTags[2], getColorModel());

        int ecoLineStride = ecoAccessor.getScanlineStride();
        int presLineStride = presAccessor.getScanlineStride();
        int ecoPixelStride = ecoAccessor.getPixelStride();
        int presPixelStride = presAccessor.getPixelStride();
        int srcX = ecoAccessor.getX();
        int srcY = ecoAccessor.getY();
        int[] ecoBandOffsets = ecoAccessor.getBandOffsets();
        int[] presBandOffsets = presAccessor.getBandOffsets();
        float[][] presData = presAccessor.getFloatDataArrays(); // or just get the data array as-is?
        float[][] ecoData = ecoAccessor.getFloatDataArrays(); // or use short?

        int dstWidth = dstAccessor.getWidth();
        int dstHeight = dstAccessor.getHeight();
        int dstLineStride = dstAccessor.getScanlineStride();
        int dstPixelStride = dstAccessor.getPixelStride();

        // Use [thread]local matrix to minimize contention when accumulating impacts in matrix
        int numPressures = pressureBands.length;
        int numEcosystems = ecosystemBands.length;
        double[][] rectImpactMatrix = new double[numPressures][numEcosystems];

        assert dstAccessor.getDataType() == DataBuffer.TYPE_FLOAT;
        float[] dstData = dstAccessor.getFloatDataArray(0);
        int ecoLineOffset = 0;
        int presOffset = 0;
        // not tiled
        int dstOffset = 0;
        for (int y = 0; y < dstHeight; y++) {
            int ecoPixelOffset = ecoLineOffset;
            int presPixelOffset = presOffset;
            int dstPixelOffset = dstOffset;
            for (int x = 0; x < dstWidth; x++) {
                int x0 = srcX + x;
                int y0 = srcY + y;
                int maskValue = mask.getSample(x0, y0, 0); //(byte)maskData[mskPixelOffset]; // Is
                // this slow?
                if (maskValue != 0) { // is pixel inside ROI?
                    /* The actual cumulative impact calculation */
                    float cumulativeSum = 0.0f;
                    // Make index of all non-empty matrix elements and iterate through only that instead?
                    for (int i = 0; i < numPressures; i++) {
                        float B = presData[pressureBands[i]][presPixelOffset + presBandOffsets[pressureBands[i]]];
                        float rowSum = 0.0f;
                        for (int j = 0; j < numEcosystems; j++) {
                            double K = ks[maskValue][pressureBands[i]][ecosystemBands[j]]; // sometimes K
                            // is NaN -- why?
                            float E =
                                ecoData[ecosystemBands[j]][ecoPixelOffset + ecoBandOffsets[ecosystemBands[j]]];
                            float impact = (float)(B*E*K/commonnessIndices[j]);
                            if (!Float.isNaN(impact)) {
                                rectImpactMatrix[i][j] += impact;
                                rowSum += impact;
                            }
                        }

                        cumulativeSum += rowSum;
                    }
                    /* ... ends here. */
                    dstData[dstPixelOffset] = cumulativeSum; // +0 since band offset=0
                }

                ecoPixelOffset += ecoPixelStride;
                presPixelOffset += presPixelStride;
                dstPixelOffset += dstPixelStride;
            }

            ecoLineOffset += ecoLineStride;
            presOffset += presLineStride;
            dstOffset += dstLineStride;
        }

        if (dstAccessor.isDataCopy()) {
            /* Clamping is not necessary */
            dstAccessor.copyDataToRaster();
        }

        accumulateImpactMatrix(rectImpactMatrix);
    }

    protected synchronized void accumulateImpactMatrix(double[][] rectImpactMatrix) {
        int numPressures = pressureBands.length;
        int numEcosystems = ecosystemBands.length;
        for (int i = 0; i < numPressures; i++)
            for (int j = 0; j < numEcosystems; j++)
                impactMatrix[i][j] += rectImpactMatrix[i][j];
    }

    @Override
    public Object getProperty(String name) {
        if (name.equals(IMPACT_MATRIX_PROPERTY_NAME)) {
            return impactMatrix;         // assert finished?
        } else
            return super.getProperty(name);
    }
//
//    @Override
//    public Class getPropertyClass(String name) {
//        if (name.equals(IMPACT_MATRIX_PROPERTY_NAME)) {
//            return double[][].class;
//        } else
//            return super.getPropertyClass(name);
//    }
}
