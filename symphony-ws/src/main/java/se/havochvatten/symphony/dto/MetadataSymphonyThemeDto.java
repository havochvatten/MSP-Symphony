package se.havochvatten.symphony.dto;

import java.util.List;

public class MetadataSymphonyThemeDto {
    String symphonyThemeName;
    String symphonyThemeNameLocal;
    List<MetadataPropertyDto> properties;

    public String getSymphonyThemeName() {
        return symphonyThemeName;
    }

    public void setSymphonyThemeName(String themeName) {
        this.symphonyThemeName = themeName;
    }

    public List<MetadataPropertyDto> getProperties() {
        return properties;
    }

    public void setProperties(List<MetadataPropertyDto> properties) {
        this.properties = properties;
    }

    public String getSymphonyThemeNameLocal() {
        return symphonyThemeNameLocal;
    }

    public void setSymphonyThemeNameLocal(String symphonyThemeNameLocal) {
        this.symphonyThemeNameLocal = symphonyThemeNameLocal;
    }

}
