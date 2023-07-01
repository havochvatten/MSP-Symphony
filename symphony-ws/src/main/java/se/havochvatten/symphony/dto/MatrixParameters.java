package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Collections;
import java.util.List;

public class MatrixParameters {
    public enum MatrixType {
        STANDARD, OPTIONAL, CUSTOM
    }
    public static class AreaTypeRef {
        public int id;
        public List<AreaMatrixMapping> areaMatrices; // any specific matrix-area mappings to use

        @JsonCreator
        public AreaTypeRef(@JsonProperty("id") int id,
                           @JsonProperty("areaMatrices") List<AreaMatrixMapping> mapping) {
            this.id = id;
            this.areaMatrices = mapping;
        }
    }

    public MatrixType matrixType;

    public Integer matrixId;
    public List<AreaTypeRef> areaTypes;

    public MatrixParameters() {
        this.matrixType = MatrixType.STANDARD;
        this.matrixId = null;
        this.areaTypes = Collections.emptyList();
    }

    public MatrixParameters(String matrixType, Integer id) {
        this.matrixType = MatrixType.valueOf(matrixType);
        this.matrixId = id;
        this.areaTypes = Collections.emptyList();
    }

    @JsonCreator
    public MatrixParameters(@JsonProperty("matrixType") MatrixType type,
                            @JsonProperty("matrixId") Integer id,
                            @JsonProperty("areaTypes") List<AreaTypeRef> types) {
        matrixType = type;
        matrixId = id;
        areaTypes = types;
    }
}
