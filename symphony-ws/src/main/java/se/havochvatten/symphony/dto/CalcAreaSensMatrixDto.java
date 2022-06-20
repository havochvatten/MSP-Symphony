package se.havochvatten.symphony.dto;

import se.havochvatten.symphony.entity.CalcAreaSensMatrix;

public class CalcAreaSensMatrixDto {
    Integer id;
    String comment;
    Integer calcareaId;
    Integer sensmatrixId;
    String matrixName;
    String areaName;

    public CalcAreaSensMatrixDto() {
        // intentionally
    }

    public CalcAreaSensMatrixDto(CalcAreaSensMatrix entity) {
        this.id = entity.getId();
        this.comment = entity.getComment();
        if (entity.getCalculationArea() != null) {
            this.calcareaId = entity.getCalculationArea().getId();
        }
        if (entity.getSensitivityMatrix() != null) {
            this.sensmatrixId = entity.getSensitivityMatrix().getId();
        }
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Integer getCalcareaId() {
        return calcareaId;
    }

    public void setCalcareaId(Integer calcareaId) {
        this.calcareaId = calcareaId;
    }

    public Integer getSensmatrixId() {
        return sensmatrixId;
    }

    public void setSensmatrixId(Integer sensmatrixId) {
        this.sensmatrixId = sensmatrixId;
    }

    public String getMatrixName() {
        return matrixName;
    }

    public void setMatrixName(String matrixName) {
        this.matrixName = matrixName;
    }

    public String getAreaName() {
        return areaName;
    }

    public void setAreaName(String areaName) {
        this.areaName = areaName;
    }

}
