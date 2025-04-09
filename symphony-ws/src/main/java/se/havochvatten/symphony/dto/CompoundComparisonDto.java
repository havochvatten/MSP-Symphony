package se.havochvatten.symphony.dto;

import se.havochvatten.symphony.calculation.ComparisonResult;
import se.havochvatten.symphony.entity.CompoundComparison;

import java.util.Map;

public class CompoundComparisonDto {

    private Integer id;
    private String name;
    private Map<Integer, ComparisonResult> results;

    public CompoundComparisonDto(CompoundComparison compoundComparison) {
        this.id = compoundComparison.getId();
        this.name = compoundComparison.getName();
        this.results = compoundComparison.getResult();
    }

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Map<Integer, ComparisonResult> getResults() {
        return results;
    }
}
