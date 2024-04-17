package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.HashMap;
import java.util.Map;

public class AlternativeLayerMapping {
    public String altId;
    public int srcBandNumber;
    public int altBandNumber;
    public LayerType layerType;

    @JsonIgnore
    public String getTitle() {
        String title = meta.get("title");
        return title == null ? "Alt band " + altId : title;
    }

    Map<String, String> meta = new HashMap<>();
    public Map<String, String> getMeta() {
        return meta;
    }
}
