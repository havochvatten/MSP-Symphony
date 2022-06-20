package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class AreaMatrixMapping { // Make Map instead?
    Integer areaId;
    Integer matrixId;

    @JsonCreator
    public AreaMatrixMapping(@JsonProperty("areaId") int areaId, @JsonProperty("matrixId") int matrixId) {
        this.areaId = areaId;
        this.matrixId = matrixId;
    }

    public Integer getAreaId() {
        return areaId;
    }

    public Integer getMatrixId() {
        return matrixId;
    }

}
