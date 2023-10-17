package se.havochvatten.symphony.scenario;

public record ScenarioSplitOptions(
    String batchName,
    boolean applyScenarioChanges,
    boolean applyAreaChanges,
    boolean batchSelect) {}
