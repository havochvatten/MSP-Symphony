package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import se.havochvatten.symphony.entity.CalculationResult;

import java.util.Date;

// TODO: Do away with this one? Or at least include parameters
// (when ROI has been replaced with an ID instead of the full polygon data)
public class CalculationResultSlice {
    public int id;
    public String name; // params.areaName by default
    public long timestamp;
//    public int[] skippedEcosystemBands;
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

    public String getName() {return name;}
}
