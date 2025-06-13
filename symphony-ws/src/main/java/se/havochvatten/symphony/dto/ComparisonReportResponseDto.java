package se.havochvatten.symphony.dto;

import java.util.List;
import java.util.Map;

public class ComparisonReportResponseDto {
    private ReportResponseDto a; // base scenario
    private ReportResponseDto b; // what-if

    private Map<String, List> chartDataPositive;
    private Map<String, List> chartDataNegative;

    public ComparisonReportResponseDto(
            ReportResponseDto a,
            ReportResponseDto b) {
        this.a = a;
        this.b = b;
    }

    public ReportResponseDto getA() {
        return a;
    }

    public ReportResponseDto getB() {
        return b;
    }

    public Map<String, List> getChartDataPositive() {
        return chartDataPositive;
    }

    public Map<String, List> getChartDataNegative() {
        return chartDataNegative;
    }

    public void setChartDataPositive(Map<String, List> chartDataPositive) {
        this.chartDataPositive = chartDataPositive;
    }

    public void setChartDataNegative(Map<String, List> chartDataNegative) {
        this.chartDataNegative = chartDataNegative;
    }
}
