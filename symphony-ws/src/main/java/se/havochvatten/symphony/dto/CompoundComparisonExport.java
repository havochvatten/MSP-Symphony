package se.havochvatten.symphony.dto;

public class CompoundComparisonExport {

    public static class ComparisonResultExport {
        public ComparisonResultExport() {}
        public String calculationName;
        public String[] ecosystemTitles;
        public String[] pressureTitles;
        public double[][] comparisonMatrix;
        public double cumulativeTotal;
    }

    public int id;
    public String baselineName;
    public String name;
    public ComparisonResultExport[] result;
}
