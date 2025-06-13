package se.havochvatten.symphony.scenario;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.geotools.data.geojson.GeoJSONReader;
import org.opengis.feature.simple.SimpleFeature;

import java.io.IOException;

public record ScenarioAreaRecord(String areaName, JsonNode featureJson, Integer excludedCoastal) {

    public ScenarioAreaRecord(String areaName, JsonNode featureJson) {
        this(areaName, featureJson, -1);
    }

    private static final ObjectMapper mapper = new ObjectMapper();

    // NB, adhoc null-safe accessor for compatibility with previously
    // persisted records only.
    // It's desirable to remove this when deemed possible.
    public Integer getExcludedCoastal() {
        if (excludedCoastal == null) {
            return -1;
        }
        return excludedCoastal;
    }

    @JsonIgnore
    public SimpleFeature getFeature() {
        try {
            return GeoJSONReader.parseFeature(mapper.writeValueAsString(featureJson));
        } catch (IOException e) {
            throw new RuntimeException(String.format("Unable to parse feature: %s", featureJson.toString()));
        }
    }
}
