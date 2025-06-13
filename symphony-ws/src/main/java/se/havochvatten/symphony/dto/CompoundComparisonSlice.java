package se.havochvatten.symphony.dto;

import java.util.Date;

public class CompoundComparisonSlice {
    private final Integer id;
    private final String name;
    private final String[] calculationNames;
    private final long timestamp;

    public CompoundComparisonSlice(int cmpId, String cmpName, String[] calculationNames, Date timestamp) {
        this.id = cmpId;
        this.name = cmpName;
        this.calculationNames = calculationNames;
        this.timestamp = timestamp.getTime();
    }

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String[] getCalculationNames() {
        return calculationNames;
    }

    public long getTimestamp() {
        return timestamp;
    }
}
