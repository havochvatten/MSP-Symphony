package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.geotools.filter.Filters;

public class LegendDto {
    public enum Type {
        ECOSYSTEM, PRESSURE, RESULT, COMPARISON
    }

    public static class ColorMapEntry {
        public String color; // web hex value
        public int quantity; // same range as source raster values, except for result which is in percent
        @JsonInclude(JsonInclude.Include.NON_NULL)
        public Float opacity; // [0,1]

        public ColorMapEntry(org.geotools.styling.ColorMapEntry entry, Type type) {
            color = Filters.asString(entry.getColor());
            double q = Filters.asDouble(entry.getQuantity());
            switch (type) {
                case RESULT:
                case COMPARISON:
                    quantity = (int) (100 * q);
                    break;
                default:
                    quantity = (int) q;
            }
            opacity = entry.getOpacity() != null ? (float) Filters.asDouble(entry.getColor()) : null;
        }
    }

    public String unit;
    public ColorMapEntry[] colorMap;
}
