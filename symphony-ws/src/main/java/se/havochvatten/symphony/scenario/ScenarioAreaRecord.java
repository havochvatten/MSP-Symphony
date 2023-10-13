package se.havochvatten.symphony.scenario;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.geotools.data.geojson.GeoJSONReader;
import org.opengis.feature.simple.SimpleFeature;

import java.io.IOException;

public record ScenarioAreaRecord(String areaName, JsonNode featureJson) {
    private static final ObjectMapper mapper = new ObjectMapper();

    @JsonIgnore
    public SimpleFeature getFeature() {
        try {
            return GeoJSONReader.parseFeature(mapper.writeValueAsString(featureJson));
        } catch (IOException e) {
            throw new RuntimeException("Unable to parse feature: "+featureJson.toString());
        }
    }
}
