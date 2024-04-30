package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.HashMap;
import java.util.Map;

public class UserDto {
    public String username;

    public Map<String, Object> settings = new HashMap<>();

    @JsonCreator
    public UserDto(@JsonProperty("username") String username, @JsonProperty("settings") Map<String, Object> settings) {
        this.username = username;
        this.settings = settings;
    }
}
