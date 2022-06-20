package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class UserDto {
    public String username;

    @JsonCreator
    public UserDto(@JsonProperty("username") String username) {
        this.username = username;
    }
}
