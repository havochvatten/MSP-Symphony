package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Collections;
import java.util.List;

public class MatrixParameters {
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

    public Integer userDefinedMatrixId;
    public List<AreaTypeRef> areaTypes;

    public MatrixParameters(Integer id) {
        userDefinedMatrixId = id;
        areaTypes = Collections.emptyList();
    }

    @JsonCreator
    public MatrixParameters(@JsonProperty("userDefinedMatrixId") Integer id,
                            @JsonProperty("areaTypes") List<AreaTypeRef> types) {
        userDefinedMatrixId = id;
        areaTypes = types;
    }
}
