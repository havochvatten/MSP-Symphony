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
}
