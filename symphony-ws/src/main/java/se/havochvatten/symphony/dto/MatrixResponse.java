package se.havochvatten.symphony.dto;

import java.util.List;

public class MatrixResponse {
    public List<AreaMatrixResponse> areaMatrixResponses; // TODO: rename
    public List<SensitivityMatrix> sensitivityMatrices; // TODO: Replace with map from matrix id to matrix
    // data
    public double normalizationValue;
}
