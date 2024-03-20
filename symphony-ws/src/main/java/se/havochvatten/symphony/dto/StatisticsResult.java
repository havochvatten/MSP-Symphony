package se.havochvatten.symphony.dto;

public record StatisticsResult(double min, double max, double average, double stddev, double[] histogram, long pixels) {}
