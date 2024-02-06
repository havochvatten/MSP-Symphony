package se.havochvatten.symphony.calculation;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.models.auth.In;

import java.util.HashMap;
import java.util.Map;

import static se.havochvatten.symphony.service.ReportService.getComponentTotals;
import static se.havochvatten.symphony.service.ReportService.impactPerComponent;
public class ComparisonResult {

    public String calculationName;
    public int[] includedEcosystems;
    public int[] includedPressures;
    public double[][] result;

    public Map<Integer, Double> totalPerEcosystem;
    public Map<Integer, Double> totalPerPressure;

    public double cumulativeTotal;

    public ComparisonResult() {}

    @JsonCreator
    public ComparisonResult(
        @JsonProperty("calculationName") String calculationName,
        @JsonProperty("includedEcosystems") int[] includedEcosystems,
        @JsonProperty("includedPressures") int[] includedPressures,
        @JsonProperty("result") double[][] result,
        @JsonProperty("totalPerEcosystem") Map<Integer, Double> totalPerEcosystem,
        @JsonProperty("totalPerPressure")  Map<Integer, Double> totalPerPressure,
        @JsonProperty("cumulativeTotal") double cumulativeTotal) {

        this.calculationName = calculationName;
        this.includedEcosystems = includedEcosystems;
        this.includedPressures = includedPressures;
        this.result = result;
        this.totalPerEcosystem = totalPerEcosystem;
        this.totalPerPressure = totalPerPressure;
        this.cumulativeTotal = cumulativeTotal;

    }

    public ComparisonResult(int[] includedEcosystems, int[] includedPressures, double[][] result, String calculationName) {
        this.includedEcosystems = includedEcosystems;
        this.includedPressures = includedPressures;
        this.result = result;
        this.calculationName = calculationName;

        double[] pressureTotals = new double[includedPressures.length];
        double[] ecosystemTotals = new double[includedEcosystems.length];

        cumulativeTotal = getComponentTotals(result, pressureTotals, ecosystemTotals);
        totalPerPressure = impactPerComponent(includedPressures, pressureTotals);
        totalPerEcosystem = impactPerComponent(includedEcosystems, ecosystemTotals);
    }
}
