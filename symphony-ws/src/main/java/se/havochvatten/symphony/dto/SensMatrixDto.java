package se.havochvatten.symphony.dto;

public class SensMatrixDto {
    Integer id;
    String name;
    String owner;
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

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public SensitivityDto getSensMatrix() {
        return sensMatrix;
    }

    public void setSensMatrix(SensitivityDto smatrix) {
        this.sensMatrix = smatrix;
    }
}
