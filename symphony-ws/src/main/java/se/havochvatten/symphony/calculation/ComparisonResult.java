package se.havochvatten.symphony.calculation;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import se.havochvatten.symphony.dto.StatisticsResult;

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

    public double area_m2;
    public double average;
    public double standardDeviation;
    public int max;
    public long pixels;
    public boolean planar;

    public ComparisonResult() {}

    @JsonCreator
    public ComparisonResult(
        @JsonProperty("calculationName") String calculationName,
        @JsonProperty("includedEcosystems") int[] includedEcosystems,
        @JsonProperty("includedPressures") int[] includedPressures,
        @JsonProperty("result") double[][] result,
        @JsonProperty("totalPerEcosystem") Map<Integer, Double> totalPerEcosystem,
        @JsonProperty("totalPerPressure")  Map<Integer, Double> totalPerPressure,
        @JsonProperty("cumulativeTotal") double cumulativeTotal,
        @JsonProperty("area_m2") double area_m2,
        @JsonProperty("average") double average,
        @JsonProperty("standardDeviation") double standardDeviation,
        @JsonProperty("max") int max,
        @JsonProperty("pixels") int pixels,
        @JsonProperty("planar") boolean planar) {
        this.calculationName = calculationName;
        this.includedEcosystems = includedEcosystems;
        this.includedPressures = includedPressures;
        this.result = result;
        this.totalPerEcosystem = totalPerEcosystem;
        this.totalPerPressure = totalPerPressure;
        this.cumulativeTotal = cumulativeTotal;
        this.area_m2 = area_m2;
        this.average = average;
        this.standardDeviation = standardDeviation;
        this.max = max;
        this.pixels = pixels;
        this.planar = planar;
    }

    public ComparisonResult(int[] includedEcosystems, int[] includedPressures, double[][] result, String calculationName,
                            double area_m2, boolean planar, StatisticsResult statistics) {
        this.includedEcosystems = includedEcosystems;
        this.includedPressures = includedPressures;
        this.result = result;
        this.calculationName = calculationName;
        this.area_m2 = area_m2;
        this.average = statistics.average();
        this.standardDeviation = statistics.stddev();
        this.max = (int) statistics.max();
        this.pixels = statistics.pixels();
        this.planar = planar;

        double[] pressureTotals = new double[includedPressures.length];
        double[] ecosystemTotals = new double[includedEcosystems.length];

        cumulativeTotal = getComponentTotals(result, pressureTotals, ecosystemTotals);
        totalPerPressure = impactPerComponent(includedPressures, pressureTotals);
        totalPerEcosystem = impactPerComponent(includedEcosystems, ecosystemTotals);
    }
}
