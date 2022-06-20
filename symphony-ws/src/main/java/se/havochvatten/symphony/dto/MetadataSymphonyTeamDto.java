package se.havochvatten.symphony.dto;

import java.util.List;

public class MetadataSymphonyTeamDto {
    String symphonyTeamName;
    String symphonyTeamNameLocal;
    List<MetadataPropertyDto> properties;

    public String getSymphonyTeamName() {
        return symphonyTeamName;
    }

    public void setSymphonyTeamName(String teamName) {
        this.symphonyTeamName = teamName;
    }

    public List<MetadataPropertyDto> getProperties() {
        return properties;
    }

    public void setProperties(List<MetadataPropertyDto> properties) {
        this.properties = properties;
    }

    public String getSymphonyTeamNameLocal() {
        return symphonyTeamNameLocal;
    }

    public void setSymphonyTeamNameLocal(String symphonyTeamNameLocal) {
        this.symphonyTeamNameLocal = symphonyTeamNameLocal;
    }

}
