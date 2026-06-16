package se.havochvatten.symphony.dto;

public class SystemPropertiesDto {

    private boolean publicAccess;

    public SystemPropertiesDto(boolean publicAccess) {
        this.publicAccess = publicAccess;
    }

    public boolean isPublicAccess() {
        return publicAccess;
    }
}
