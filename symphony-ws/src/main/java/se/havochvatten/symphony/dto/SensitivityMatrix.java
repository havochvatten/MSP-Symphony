package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class SensitivityMatrix {
    final int matrixId;
    final double[][] matrixValues;

    @JsonCreator
    public SensitivityMatrix(@JsonProperty("matrixId") int id, @JsonProperty("matrixValues") double[][] k) {
        matrixId = id;
        matrixValues = k;
    }

    public Integer getMatrixId() {
        return matrixId;
    }

    public double[][] getMatrixValues() {
        return matrixValues;
    }
}
