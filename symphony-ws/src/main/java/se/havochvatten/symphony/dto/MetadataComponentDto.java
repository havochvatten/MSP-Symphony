package se.havochvatten.symphony.dto;

import java.util.ArrayList;
import java.util.List;

public class MetadataComponentDto {
    List<MetadataSymphonyThemeDto> symphonyThemes;

    public List<MetadataSymphonyThemeDto> getSymphonyThemes() {
        if (symphonyThemes == null) {
            symphonyThemes = new ArrayList<>();
        }
        return symphonyThemes;
    }

    public void setSelectedBands(int[] bands) {
        for (MetadataSymphonyThemeDto theme : getSymphonyThemes()) {
            for (SymphonyBandDto band : theme.getBands()) {
                band.setSelected(false);
                for (int id : bands) {
                    if (band.getBandNumber() == id) {
                        band.setSelected(true);
                        break;
                    }
                }
            }
        }
    }
}
