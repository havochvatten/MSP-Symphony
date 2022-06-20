package se.havochvatten.symphony.dto;

public class SensMatrixDto {
    Integer id;
    String name;
    SensitivityDto sensMatrix;

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

    public SensitivityDto getSensMatrix() {
        return sensMatrix;
    }

    public void setSensMatrix(SensitivityDto smatrix) {
        this.sensMatrix = smatrix;
    }
}
