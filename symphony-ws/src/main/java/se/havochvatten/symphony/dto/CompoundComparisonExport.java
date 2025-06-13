package se.havochvatten.symphony.dto;

public class CompoundComparisonExport {
    private int id;
    private String baselineName;
    private String name;
    private ComparisonResultExport[] result;

    public static class ComparisonResultExport {
        public ComparisonResultExport() {}
        private String calculationName;
        private String[] ecosystemTitles;
        private String[] pressureTitles;
        private double[][] baselineMatrix;
        private double[][] comparisonMatrix;
        private double cumulativeTotalBaseline;
        private double cumulativeTotalDifference;

        public String getCalculationName() {
            return calculationName;
        }

        public void setCalculationName(String calculationName) {
            this.calculationName = calculationName;
        }

        public String[] getEcosystemTitles() {
            return ecosystemTitles;
        }

        public void setEcosystemTitles(String[] ecosystemTitles) {
            this.ecosystemTitles = ecosystemTitles;
        }

        public String[] getPressureTitles() {
            return pressureTitles;
        }

        public void setPressureTitles(String[] pressureTitles) {
            this.pressureTitles = pressureTitles;
        }

        public double[][] getBaselineMatrix() {
            return baselineMatrix;
        }

        public void setBaselineMatrix(double[][] baselineMatrix) {
            this.baselineMatrix = baselineMatrix;
        }

        public double[][] getComparisonMatrix() {
            return comparisonMatrix;
        }

        public void setComparisonMatrix(double[][] comparisonMatrix) {
            this.comparisonMatrix = comparisonMatrix;
        }

        public double getCumulativeTotalBaseline() {
            return cumulativeTotalBaseline;
        }

        public void setCumulativeTotalBaseline(double cumulativeTotalBaseline) {
            this.cumulativeTotalBaseline = cumulativeTotalBaseline;
        }

        public double getCumulativeTotalDifference() {
            return cumulativeTotalDifference;
        }

        public void setCumulativeTotalDifference(double cumulativeTotalDifference) {
            this.cumulativeTotalDifference = cumulativeTotalDifference;
        }
    }

    public CompoundComparisonExport(int id, String baselineName, String name, ComparisonResultExport[] result) {
        this.id = id;
        this.baselineName = baselineName;
        this.name = name;
        this.result = result;
    }

    public int getId() {
        return id;
    }

    public String getBaselineName() {
        return baselineName;
    }

    public String getName() {
        return name;
    }

    public ComparisonResultExport[] getResult() {
        return result;
    }
}
