package se.havochvatten.symphony.calculation;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import se.havochvatten.symphony.dto.StatisticsResult;

import java.util.HashMap;
import java.util.Map;

import static se.havochvatten.symphony.service.ReportService.getComponentTotals;
import static se.havochvatten.symphony.service.ReportService.impactPerComponent;
public class ComparisonResult {

    public record ComparisonTotal(double totalDifference, double totalBaseline) {}

    public String calculationName;
    public int[] includedEcosystems;
    public int[] includedPressures;

    public double[][] baseline;
    public double[][] result;

    public Map<Integer, ComparisonTotal> totalPerEcosystem;
    public Map<Integer, ComparisonTotal> totalPerPressure;

    public double cumulativeTotal;
    public double cumulativeTotalDiff;

    public double area_m2;

    public StatisticsResult statisticsDiff;
    public StatisticsResult statisticsBaseline;
    public boolean planar;

    public ComparisonResult() {}

    @JsonCreator
    public ComparisonResult(
        @JsonProperty("calculationName") String calculationName,
        @JsonProperty("includedEcosystems") int[] includedEcosystems,
        @JsonProperty("includedPressures") int[] includedPressures,
        @JsonProperty("baseline") double[][] baseline,
        @JsonProperty("result") double[][] result,
        @JsonProperty("totalPerEcosystem") Map<Integer, ComparisonTotal> totalPerEcosystem,
        @JsonProperty("totalPerPressure")  Map<Integer, ComparisonTotal> totalPerPressure,
        @JsonProperty("cumulativeTotal") double cumulativeTotal,
        @JsonProperty("cumulativeTotalDiff") double cumulativeTotalDiff,
        @JsonProperty("statisticsDiff") StatisticsResult statisticsDiff,
        @JsonProperty("statisticsBaseline") StatisticsResult statisticsBaseline,
        @JsonProperty("area_m2") double area_m2,
        @JsonProperty("planar") boolean planar) {
        this.calculationName = calculationName;
        this.includedEcosystems = includedEcosystems;
        this.includedPressures = includedPressures;
        this.baseline = baseline;
        this.result = result;
        this.totalPerEcosystem = totalPerEcosystem;
        this.totalPerPressure = totalPerPressure;
        this.cumulativeTotal = cumulativeTotal;
        this.cumulativeTotalDiff = cumulativeTotalDiff;
        this.area_m2 = area_m2;
        this.statisticsDiff = statisticsDiff;
        this.statisticsBaseline = statisticsBaseline;
        this.planar = planar;
    }

    public ComparisonResult(int[] includedEcosystems, int[] includedPressures, double[][] baseline, double[][] result, String calculationName,
                            double area_m2, boolean planar, StatisticsResult statisticsDiff, StatisticsResult statisticsBaseline) {
        this.includedEcosystems = includedEcosystems;
        this.includedPressures = includedPressures;
        this.result = result;
        this.baseline = baseline;
        this.calculationName = calculationName;
        this.area_m2 = area_m2;
        this.statisticsDiff = statisticsDiff;
        this.statisticsBaseline = statisticsBaseline;
        this.planar = planar;
        this.totalPerPressure = new HashMap<>();
        this.totalPerEcosystem = new HashMap<>();

        double[] pressureTotalDiff = new double[includedPressures.length],
                 ecosystemTotalDiff = new double[includedEcosystems.length],
                 pressureTotals = new double[includedPressures.length],
                 ecosystemTotals = new double[includedEcosystems.length];

        cumulativeTotalDiff = getComponentTotals(result, pressureTotalDiff, ecosystemTotalDiff);
        cumulativeTotal = getComponentTotals(baseline, pressureTotals, ecosystemTotals);

        Map<Integer, Double> totalDiffPerPressure       = impactPerComponent(includedPressures, pressureTotalDiff),
                             totalBaselinePerPressure   = impactPerComponent(includedPressures, pressureTotals),
                             totalDiffPerEcosystem      = impactPerComponent(includedEcosystems, ecosystemTotalDiff),
                             totalBaselinePerEcosystem  = impactPerComponent(includedEcosystems, ecosystemTotals);

        for (int pressure : includedPressures) {
            totalPerPressure.put(pressure,
                new ComparisonTotal(totalDiffPerPressure.get(pressure), totalBaselinePerPressure.get(pressure)));
        }

        for (int ecosystem : includedEcosystems) {
            totalPerEcosystem.put(ecosystem,
                new ComparisonTotal(totalDiffPerEcosystem.get(ecosystem), totalBaselinePerEcosystem.get(ecosystem)));
        }
    }
}
