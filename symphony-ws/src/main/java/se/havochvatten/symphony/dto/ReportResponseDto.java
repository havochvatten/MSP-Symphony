package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;
import java.util.Map;

// TODO Rework in light of calc-ws merge?
public class ReportResponseDto {
    public static class DefaultMatrixData {
        public String defaultMatrix;
        public Map<String, String[]> areaTypes;

        public DefaultMatrixData(String defaultName, Map<String, String[]> areaTypes) {
            defaultMatrix = defaultName;
            this.areaTypes = areaTypes;
        }
    }

    public record AreaMatrix (String areaName, String matrix) {}

    public String name;
    public String baselineName;
    public String operationName;
    public Map<String, String> operationOptions;
    public double total;
    public double average;
    public double min;
    public double max;
    public double stddev;
    public double[] histogram;
    public double geographicalArea; // in m²

    public long calculatedPixels;
    public double gridResolution; // in m

    public AreaMatrix[] areaMatrices;
    public NormalizationOptions normalization;
    public Map<Integer, Double> impactPerPressure; // N.B: accumulated total, not percentage
    public Map<Integer, Double> impactPerEcoComponent;
    public Map<String, List> chartData;
    public JsonNode scenarioChanges;
    public long timestamp;
}
