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
        private int id;
        private List<AreaMatrixMapping> areaMatrices; // any specific matrix-area mappings to use

        @JsonCreator
        public AreaTypeRef(@JsonProperty("id") int id,
                           @JsonProperty("areaMatrices") List<AreaMatrixMapping> mapping) {
            this.id = id;
            this.areaMatrices = mapping;
        }

        public int getId() {
            return id;
        }

        public List<AreaMatrixMapping> getAreaMatrices() {
            return areaMatrices;
        }
    }

    private MatrixType matrixType;

    private Integer matrixId;
    private List<AreaTypeRef> areaTypes;

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

    public MatrixType getMatrixType() {
        return matrixType;
    }

    public void setMatrixType(MatrixType matrixType) {
        this.matrixType = matrixType;
    }

    public Integer getMatrixId() {
        return matrixId;
    }

    public void setMatrixId(Integer matrixId) {
        this.matrixId = matrixId;
    }

    public List<AreaTypeRef> getAreaTypes() {
        return areaTypes;
    }

    public void setAreaTypes(List<AreaTypeRef> areaTypes) {
        this.areaTypes = areaTypes;
    }
}
