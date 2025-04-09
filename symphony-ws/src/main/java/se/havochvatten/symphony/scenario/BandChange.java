package se.havochvatten.symphony.scenario;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import se.havochvatten.symphony.dto.LayerType;

// TODO: Add user-defined matrix id? (integer)
public class BandChange {
    private LayerType type; // TODO: Use Jackson subtype deserialization?

    @JsonIgnore
    public Integer band; // Only used detached in calculation step on server side, not persisted

    /**
     * Number to multiply intensity value by
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public Double multiplier = null;

    /**
     * Number to add to intensity value
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public Double offset = null;

    public BandChange() {} // necessary for Jackson databind deserialization

    public BandChange(LayerType type, int band, double mul, double offset) {
        this.type = type;
        this.band = band;
        this.multiplier = mul;
        this.offset = offset;
    }

    @Override
    public String toString() {
        return "BandChange{type=" + type + ", band=" + band +
                ", multiplier=" + multiplier + ", offset=" + offset + '}';
    }

    public LayerType getType() {
        return type;
    }
}
