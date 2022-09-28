package se.havochvatten.symphony.calculation.jai.CIA;

import org.apache.commons.lang3.ArrayUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.media.jai.*;
import java.awt.*;
import java.awt.image.Raster;
import java.awt.image.RenderedImage;
import java.awt.image.WritableRaster;
import java.util.Map;
import java.util.concurrent.atomic.AtomicIntegerArray;

/**
 * JAI operation for computing cumulative impact assessment
 * <p>
 * This operation has no notion of geography.
 */
public class CumulativeImpactOp extends PointOpImage {
    private static final Logger LOG = LoggerFactory.getLogger(CumulativeImpactOp.class);

    public final static int TRANSPARENT_VALUE = 0;
    public final static String IMPACT_MATRIX_PROPERTY_NAME = "se.havochvatten.symphony.impact_matrix";

    /** Sensitivity matrix */
    protected double[][][] ks;

    protected final Raster mask;

    private final double[][] impactMatrix;
    protected final int[] ecosystemBands;
    protected final int[] pressureBands;

    private final AtomicIntegerArray tileCalculationCount =
        new AtomicIntegerArray(getNumXTiles()*getNumYTiles());

    public CumulativeImpactOp(RenderedImage ecosystemsData, RenderedImage pressuresData,
                              ImageLayout layout, Map config,
                              double[][][] matrices, Raster mask,
                              int[] ecosystems, int[] pressures) {
        super(ecosystemsData, pressuresData, layout, config, true); // source cobbling -- do we need it?

        LOG.debug("CulumativeImpactOp: tile scheduler parallelism=" + JAI.getDefaultInstance().getTileScheduler().getParallelism());

//        permitInPlaceOperation();
        // Setting matrix
        ks = matrices;
        this.mask = mask;
        this.ecosystemBands = ecosystems;
        this.pressureBands = pressures;

        this.impactMatrix = new double[pressureBands.length][ecosystemBands.length];
//        setProperty(IMPACT_MATRIX_PROPERTY_NAME, new double[] {0});
    }

    private static final double[] TRANSPARENCY = {TRANSPARENT_VALUE};

    @Override
    protected void computeRect(Raster[] sources, WritableRaster dst, Rectangle dstRect) {
//    protected void computeRect(PlanarImage[] sources, WritableRaster dst, Rectangle dstRect) { // uncobbled sources
        LOG.info("computeRect: " + dstRect + ", thread=" + Thread.currentThread().getId());

        RasterFormatTag[] formatTags = getFormatTags();
        Rectangle srcRect = mapDestRect(dstRect, 0);

        // FIXME do away with raster accessors for source, instead use sources[x].getTile
        RasterAccessor ecoAccessor = new RasterAccessor(sources[0]/*.getData(srcRect)*/, srcRect, formatTags[0],
                getSourceImage(0).getColorModel());
        RasterAccessor presAccessor = new RasterAccessor(sources[1]/*.getData(srcRect)*/, srcRect, formatTags[1],
                getSourceImage(1).getColorModel());
        RasterAccessor dstAccessor = new RasterAccessor(dst, dstRect, formatTags[2], getColorModel());
        // TODO Perhaps use something less sophisticated than a RasterAccesor (since it's untiled)
//        RasterAccessor maskAccessor = new RasterAccessor(mask.getRaster(),
//                new Rectangle(mask.getRaster().getBounds()), formatTags[2], mask.getImage().getColorModel());
//        var maskRaster = mask.getRaster(); // FIXME pass as Raster instead

        int ecoLineStride = ecoAccessor.getScanlineStride();
        int presLineStride = presAccessor.getScanlineStride();
        int ecoPixelStride = ecoAccessor.getPixelStride();
        int presPixelStride = presAccessor.getPixelStride();
        int srcX = ecoAccessor.getX();
        int srcY = ecoAccessor.getY();
        int[] ecoBandOffsets = ecoAccessor.getBandOffsets();
        int[] presBandOffsets = presAccessor.getBandOffsets();
        int[][] presData = presAccessor.getIntDataArrays(); // or just get the data array as-is?
        int[][] ecoData = ecoAccessor.getIntDataArrays(); // or use short?

//        int mskLineStride = maskAccessor.getScanlineStride();
//        int mskPixelStride = maskAccessor.getPixelStride();
        // mask raster should have same dimensions as dst, but byte array instead of int

        int dstWidth = dstAccessor.getWidth();
        int dstHeight = dstAccessor.getHeight();
        int dstLineStride = dstAccessor.getScanlineStride();
        int dstPixelStride = dstAccessor.getPixelStride();

        // Use [thread]local matrix to minimize contention when accumulating impacts in matrix
        int numPressures = pressureBands.length;
        int numEcosystems = ecosystemBands.length;
        int[][] rectImpactMatrix = new int[numPressures][numEcosystems];

//        sources[1].getDataBuffer()
        // FIXME sources as byte?? Or don't use RasterAccessor
        // Make maskData in input? It is not really a ROI since there is no NODATA
//        /*byte*/int[] maskData = maskAccessor.getIntDataArray(0); //maskAccessor.getByteDataArray(0);
//        int maskDataLength = maskData.length;

        int[] dstData = dstAccessor.getIntDataArray(0);
        int ecoLineOffset = 0;
        int presOffset = 0;
//        int mskOffset = mskLineStride*srcY/*+mskPixelStride*srcX*/; // compensate for the fact that the mask is
        // not tiled
        int dstOffset = 0;
        for (int y = 0; y < dstHeight; y++) {
            int ecoPixelOffset = ecoLineOffset;
            int presPixelOffset = presOffset;
//            int mskPixelOffset = mskOffset;
            int dstPixelOffset = dstOffset;
            for (int x = 0; x < dstWidth; x++) {
                int x0 = srcX + x;
                int y0 = srcY + y;
                int maskValue = mask.getSample(x0, y0, 0); //(byte)maskData[mskPixelOffset]; // Is
                // this slow?
                if (maskValue != 0) { // is pixel inside ROI?
                    /* The actual cumulative impact calculation */
                    int cumulativeSum = 0;
                    // Make index of all non-empty matrix elements and iterate through only that instead?
                    for (int i = 0; i < numPressures; i++) {
                        int B = presData[pressureBands[i]][presPixelOffset + presBandOffsets[pressureBands[i]]];
                        int rowSum = 0;
                        for (int j = 0; j < numEcosystems; j++) {
                            double K = ks[maskValue][pressureBands[i]][ecosystemBands[j]];
                            int E = ecoData[ecosystemBands[j]][ecoPixelOffset + ecoBandOffsets[ecosystemBands[j]]];
                            int impact = (int) (B*E*K); // use 1-10 matrix values => eliminate cast and faster mul?
                            rectImpactMatrix[i][j] += impact;
                            rowSum += impact;
                        }
                        cumulativeSum += rowSum;
                    }
                    /* ... ends here. */
                    dstData[dstPixelOffset] = cumulativeSum; // +0 since band offset=0
                }

                ecoPixelOffset += ecoPixelStride;
                presPixelOffset += presPixelStride;
//                mskPixelOffset += mskPixelStride;
                dstPixelOffset += dstPixelStride;
            }

            ecoLineOffset += ecoLineStride;
            presOffset += presLineStride;
//            mskOffset += mskLineStride;
            dstOffset += dstLineStride;
        }

        if (dstAccessor.isDataCopy()) {
            /* Clamping is not necessary */
            dstAccessor.copyDataToRaster();
        }

        accumulateImpactMatrix(rectImpactMatrix);
    }

    // FIXME probably not thread-safe. synchronize block for compareAndSet and computeTile?
    // What we want to do is to make sure than computeRect is not called on the same rect more than once...
    public Raster computeTile(int tileX, int tileY) {
        final int tileArrayIndex = (tileX-getMinTileX())+getNumXTiles()*(tileY-getMinTileY());

        if (!tileCalculationCount.compareAndSet(tileArrayIndex, 0, 1))
            LOG.warn("Computation of tileArrayIndex={} requested more than once", tileArrayIndex);

        return super.computeTile(tileX, tileY);
    }

    // The below adds quite a lot of overhead (20%+) Optimize? Vectors?
    // or store intermediate matrix results in an async queue and accumulate at end?
    // or use separate "tile matrix cache"? (c.f. TileCache)
    protected synchronized void accumulateImpactMatrix(int[][] rectImpactMatrix) {
        int numPressures = pressureBands.length;
        int numEcosystems = ecosystemBands.length;
        for (int i = 0; i < numPressures; i++)
            for (int j = 0; j < numEcosystems; j++)
                impactMatrix[i][j] += rectImpactMatrix[i][j];
    }

    @Override
    public Object getProperty(String name) {
        if (name.equals(IMPACT_MATRIX_PROPERTY_NAME)) {
            LOG.debug("tileCalculationCount={}", tileCalculationCount);
            for (int i=0; i<getNumXTiles()*getNumYTiles(); i++)
                if (tileCalculationCount.get(i) != 1)
                    LOG.error("tileCalculationCount[{}] != 1. Impact matrix may be erroneous! "+
                        "Consider increasing JAI tile cache size",
                        tileCalculationCount);
            return impactMatrix;         // assert finished?
        } else
            return super.getProperty(name);
    }

    @Override
    public Class getPropertyClass(String name) {
        if (name.equals(IMPACT_MATRIX_PROPERTY_NAME)) {
            return double[][].class;
        } else
            return super.getPropertyClass(name);
    }

    @Override
    public String[] getPropertyNames() {
        return ArrayUtils.add(super.getPropertyNames(), IMPACT_MATRIX_PROPERTY_NAME);
    }

    @Override
    public int getOperationComputeType() {
        return OP_COMPUTE_BOUND;
    }

}
