package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.geotools.data.geojson.GeoJSONReader;
import org.locationtech.jts.geom.Geometry;
import se.havochvatten.symphony.entity.CalculationResult;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

// TODO: Do away with this one? Or at least include parameters
// (when ROI has been replaced with an ID instead of the full polygon data)
public class CalculationResultSliceDto {
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
    }

    @JsonIgnore
    public List<Integer> ecosystemsToInclude;

    @JsonIgnore
    public List<Integer> pressuresToInclude;

    public boolean isPurged = false;

    public boolean hasChanges = false;

    public CalculationResultSliceDto(CalculationResult res) {
        id = res.getId();
        name = res.getCalculationName();
        timestamp = res.getTimestamp().getTime();
        isPurged = res.getCoverage() == null;
    }

    @JsonCreator
    public CalculationResultSliceDto(@JsonProperty("id") int id, @JsonProperty("name") String name,
                                     @JsonProperty("timestamp") Date timestamp, @JsonProperty("isPurged") boolean isPurged) {
        this.id = id;
        this.name = name;
        this.timestamp = timestamp.getTime();
        this.isPurged = isPurged;
    }

    public CalculationResultSliceDto(int id, String name, Date timestamp, boolean hasChanges, String polygon,
                                     int[] ecosystemsToInclude, int[] pressuresToInclude) {
        this.id = id;
        this.name = name;
        this.timestamp = timestamp.getTime();
        this.hasChanges = hasChanges;
        this.polygon = polygon;
        this.ecosystemsToInclude = Arrays.stream(ecosystemsToInclude).boxed().toList();
        this.pressuresToInclude = Arrays.stream(pressuresToInclude).boxed().toList();
    }

    public String getName() {return name;}
}
