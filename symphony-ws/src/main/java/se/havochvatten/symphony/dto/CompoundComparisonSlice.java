package se.havochvatten.symphony.dto;

import se.havochvatten.symphony.entity.CompoundComparison;

import java.util.Date;

public class CompoundComparisonSlice {

    public Integer id;
    public String name;
    public String calculationNames[];
    public long timestamp;

    public CompoundComparisonSlice(int cmpId, String cmpName, String[] calculationNames, Date timestamp) {
        this.id = cmpId;
        this.name = cmpName;
        this.calculationNames = calculationNames;
        this.timestamp = timestamp.getTime();
    }
}
