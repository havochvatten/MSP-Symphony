package se.havochvatten.symphony.dto;

public class MetadataDto {
    MetadataComponentDto ecoComponent;
    MetadataComponentDto pressureComponent;

    public MetadataComponentDto getEcoComponent() {
        return ecoComponent;
    }

    public void setEcoComponent(MetadataComponentDto ecoComponent) {
        this.ecoComponent = ecoComponent;
    }

    public MetadataComponentDto getPressureComponent() {
        return pressureComponent;
    }

    public void setPressureComponent(MetadataComponentDto pressureComponent) {
        this.pressureComponent = pressureComponent;
    }

}
