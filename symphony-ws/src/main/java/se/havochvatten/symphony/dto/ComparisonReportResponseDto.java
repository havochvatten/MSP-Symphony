package se.havochvatten.symphony.dto;

import java.util.List;
import java.util.Map;

public class ComparisonReportResponseDto {
    public ReportResponseDto a; // base scenario
    public ReportResponseDto b; // what-if
    public Map<String, List> chartDataPositive;
    public Map<String, List> chartDataNegative;
}
