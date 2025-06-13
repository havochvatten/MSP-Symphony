package se.havochvatten.symphony.calculation;

import se.havochvatten.symphony.dto.SensitivityMatrix;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

public class CalcUtil {
    // prevent instantiation
    private CalcUtil() {}

    public static Map<Integer, Integer> createMapFromMatrixIdToIndex(List<SensitivityMatrix> matrices) {
        Map<Integer, Integer> matrixIdToIndex = new HashMap<>();
        IntStream.range(1, matrices.size()) // start at 1 to skip non-used empty matrix
                .forEach(index -> matrixIdToIndex.put(matrices.get(index).getMatrixId(), index));
        // TODO use toMap
        return matrixIdToIndex;
    }
}
