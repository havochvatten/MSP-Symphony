package se.havochvatten.symphony.calculation;

import se.havochvatten.symphony.dto.SensitivityMatrix;

import java.awt.*;
import java.awt.image.IndexColorModel;
import java.awt.image.PixelInterleavedSampleModel;
import java.awt.image.SampleModel;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.DoublePredicate;
import java.util.stream.IntStream;

public class CalcUtil {
    public final static double NO_DATA = Double.NaN;
    public static DoublePredicate isNoData = d -> Double.isNaN(d);

    public static IndexColorModel makeIndexedColorModel(Color[] cs) {
        byte[] rs = new byte[cs.length], gs = new byte[cs.length], bs = new byte[cs.length];
        for (int i = 0; i < cs.length; i++) {
            rs[i] = (byte) (cs[i].getRed() & 0xff);
            gs[i] = (byte) (cs[i].getGreen() & 0xff);
            bs[i] = (byte) (cs[i].getBlue() & 0xff);
        }
        return new IndexColorModel(4, cs.length, rs, gs, bs, 0);
    }

    public static Map<Integer, Integer> createMapFromMatrixIdToIndex(List<SensitivityMatrix> matrices) {
        Map<Integer, Integer> matrixIdToIndex = new HashMap<>();
        IntStream.range(1, matrices.size()) // start at 1 to skip non-used empty matrix
                .forEach(index -> matrixIdToIndex.put(matrices.get(index).getMatrixId(), index));
        // TODO use toMap
        return matrixIdToIndex;
    }

    public static SampleModel createSampleModel(int dataType, SampleModel source) {
        return new PixelInterleavedSampleModel(dataType, source.getWidth(), source.getHeight(), source.getNumBands(),
                source.getNumBands() * source.getWidth(), IntStream.range(0, source.getNumBands()).toArray());
    }
}
