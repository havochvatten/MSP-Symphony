package se.havochvatten.symphony.dto;

import java.util.List;

public class UploadedUserDefinedAreaDto {
    public Integer srid;
    public List<String> featureIdentifiers;
    public String key;

    public UploadedUserDefinedAreaDto() {}

    public UploadedUserDefinedAreaDto(List<String> featureIdentifiers, Integer srid, String key) {
        this.featureIdentifiers = featureIdentifiers;
        this.srid = srid;
        this.key = key;
    }
}
