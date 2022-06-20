package se.havochvatten.symphony.dto;

import java.util.ArrayList;
import java.util.List;

public class CalculationAreaDto {
    Integer id;
    String name;
    boolean careaDefault;
    Integer defaultSensitivityMatrixId;
    List<CaPolygonDto> polygons;

    public CalculationAreaDto() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isCareaDefault() {
        return careaDefault;
    }

    public void setCareaDefault(boolean careaDefault) {
        this.careaDefault = careaDefault;
    }

    public Integer getDefaultSensitivityMatrixId() {
        return defaultSensitivityMatrixId;
    }

    public void setDefaultSensitivityMatrixId(Integer defaultSensitivityMatrixId) {
        this.defaultSensitivityMatrixId = defaultSensitivityMatrixId;
    }

    public List<CaPolygonDto> getPolygons() {
        if (polygons == null) {
            polygons = new ArrayList<>();
        }
        return polygons;
    }

}
