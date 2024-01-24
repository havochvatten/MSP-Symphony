package se.havochvatten.symphony.dto;

import se.havochvatten.symphony.entity.CalculationResult;

import java.util.Map;

class ComparisonResult {
    public int[] includedEcosystems;
    public int[] includedPressures;
    public double[][] result;

    public ComparisonResult(int[] includedEcosystems, int[] includedPressures, double[][] result) {
        this.includedEcosystems = includedEcosystems;
        this.includedPressures = includedPressures;
        this.result = result;
    }
}

public class CompoundComparisonDto {

    public Integer id;
    public String name;
    public Map<Integer, ComparisonResult> results;

    public void setId(int id) {
        this.id = id;
    }
    public void setResult(int calculationId, int[] ecosystems, int[] pressures, double[][] result) {
        ComparisonResult comparisonResult = new ComparisonResult(ecosystems, pressures, result);

        this.results.put(calculationId, comparisonResult);
    }

    public CompoundComparisonDto(String name) {
        this.name = name;
        this.results = new java.util.HashMap<>();
    }
}
