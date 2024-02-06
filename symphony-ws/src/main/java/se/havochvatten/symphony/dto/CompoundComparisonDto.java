package se.havochvatten.symphony.dto;

import se.havochvatten.symphony.calculation.ComparisonResult;
import se.havochvatten.symphony.entity.CompoundComparison;

import java.util.Map;

public class CompoundComparisonDto {

    public Integer id;
    public String name;
    public Map<Integer, ComparisonResult> results;

    public CompoundComparisonDto(CompoundComparison compoundComparison) {
        this.id = compoundComparison.getId();
        this.name = compoundComparison.getCmpName();
        this.results = compoundComparison.getCmpResult();
    }
}
