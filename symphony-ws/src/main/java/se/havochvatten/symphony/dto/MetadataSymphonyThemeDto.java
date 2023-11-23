package se.havochvatten.symphony.dto;

import java.util.List;

public class MetadataSymphonyThemeDto {
    String symphonyThemeName;

    List<SymphonyBandDto> bands;

    public String getSymphonyThemeName() {
        return symphonyThemeName;
    }

    public void setSymphonyThemeName(String themeName) {
        this.symphonyThemeName = themeName;
    }

    public List<SymphonyBandDto> getBands() {
        return bands;
    }

    public void setBands(List<SymphonyBandDto> bands) {
        this.bands = bands;
    }

}
