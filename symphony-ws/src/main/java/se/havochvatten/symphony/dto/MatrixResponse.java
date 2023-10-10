package se.havochvatten.symphony.dto;

import org.apache.commons.lang3.tuple.MutablePair;

import java.util.Map;

public class MatrixResponse {

    /**
     * Maps Scenario Area Id to a (Apache Commons) Pair of matrix Id (L)
     * and normalization value (R).
     * Used in calculation procedure only.
     */
    public Map<Integer, MutablePair<Integer, Double>> areaMatrixMap = new java.util.HashMap<>();

    public MatrixResponse(int[] areaIds) {
        for (int areaId : areaIds) {
            this.areaMatrixMap.put(areaId, new MutablePair<>(null, null));
        }
    }

    public MatrixResponse(Map<Integer, Integer> matrixMap, double[] normalizationValues) {
        int i = 0;
        for (Map.Entry<Integer, Integer> entry : matrixMap.entrySet()) {
            this.areaMatrixMap.put(entry.getKey(), new MutablePair<>(entry.getValue(), normalizationValues[i++]));
        }
    }

    public void setAreaMatrixId(int areaId, int matrixId) {
        this.areaMatrixMap.get(areaId).setLeft(matrixId);
    }

    public void setAreaNormalizationValue(int areaId, double normalizationValue) {
        this.areaMatrixMap.get(areaId).setRight(normalizationValue);
    }

    public int getAreaMatrixId(int areaId) {
        return this.areaMatrixMap.get(areaId).getLeft();
    }

    public double getAreaNormalizationValue(int areaId) {
        return this.areaMatrixMap.get(areaId).getRight();
    }
}
