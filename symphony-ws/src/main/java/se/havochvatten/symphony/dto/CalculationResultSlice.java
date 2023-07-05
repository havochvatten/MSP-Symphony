package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.geotools.data.geojson.GeoJSONReader;
import org.locationtech.jts.geom.Geometry;
import se.havochvatten.symphony.entity.CalculationResult;

import java.util.Date;

// TODO: Do away with this one? Or at least include parameters
// (when ROI has been replaced with an ID instead of the full polygon data)
public class CalculationResultSlice {
    private static final ObjectMapper mapper = new ObjectMapper();

    private String polygon;

    public int id;
    public String name; // params.areaName by default
    public long timestamp;
    @JsonIgnore
    public Geometry getGeometry() {
        if(polygon == null)
            return null;

        return GeoJSONReader.parseGeometry(polygon);
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


    public CalculationResultSlice(int id, String name, Date timestamp, String polygon) {
        this.id = id;
        this.name = name;
        this.timestamp = timestamp.getTime();
        this.polygon = polygon;
    }

    public String getName() {return name;}
}
