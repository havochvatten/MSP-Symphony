package se.havochvatten.symphony.dto;

import java.util.ArrayList;
import java.util.List;

public class MetadataComponentDto {
    List<MetadataSymphonyTeamDto> symphonyTeams;

    public List<MetadataSymphonyTeamDto> getSymphonyTeams() {
        if (symphonyTeams == null) {
            symphonyTeams = new ArrayList<>();
        }
        return symphonyTeams;
    }
}
