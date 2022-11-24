package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.geotools.data.geojson.GeoJSONReader;
import org.opengis.feature.simple.SimpleFeature;
import se.havochvatten.symphony.entity.CalculationResult;

import java.io.IOException;
import java.util.Date;

// TODO: Do away with this one? Or at least include parameters
// (when ROI has been replaced with an ID instead of the full polygon data)
public class CalculationResultSlice {
    private static final ObjectMapper mapper = new ObjectMapper();

    private String featureJson;

    public int id;
    public String name; // params.areaName by default
    public long timestamp;
    @JsonIgnore
    public SimpleFeature getFeature() {
        if(featureJson == null)
            return null;

        try {
            return GeoJSONReader.parseFeature(featureJson);
        } catch (IOException e) {
            throw new RuntimeException("Unable to parse feature: "+featureJson);
        }
    };
    // add optional param?

    public CalculationResultSlice(CalculationResult res) {
        id = res.getId();
        name = res.getCalculationName();
        timestamp = res.getTimestamp().getTime();
    }

    @JsonCreator
    public CalculationResultSlice(@JsonProperty("id") int id, @JsonProperty("name") String name,
                                  @JsonProperty("timestamp") Date timestamp) {
        this.id = id;
        this.name = name;
        this.timestamp = timestamp.getTime();
    }

    @JsonCreator
    public CalculationResultSlice(int id, String name, Date timestamp, String feature) {
        this.id = id;
        this.name = name;
        this.timestamp = timestamp.getTime();
        this.featureJson = feature;
    }

    public String getName() {return name;}
}
