package se.havochvatten.symphony.scenario;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@JsonSerialize
public record ScenarioSplitOptions(
    String batchName,
    boolean applyScenarioChanges,
    boolean applyAreaChanges,
    boolean batchSelect) {}
