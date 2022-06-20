package se.havochvatten.symphony.scenario;

import se.havochvatten.symphony.dto.LayerType;

// TODO: Add user-defined matrix id? (integer)
public class BandChange {
    public LayerType type; // TODO: Use Jackson subtype deserialization?

    public Integer band;

    /**
     * Number to multiply intensity value by
     */
    public double multiplier = 1.0;

    /**
     * Number to add to intensity value
     */
    public double offset = 0.0;

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
}