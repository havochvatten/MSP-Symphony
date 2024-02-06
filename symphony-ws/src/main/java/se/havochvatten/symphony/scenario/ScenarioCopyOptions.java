package se.havochvatten.symphony.scenario;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ScenarioCopyOptions {
    @JsonProperty
    public String name;
    @JsonProperty
    public boolean includeScenarioChanges;
    @JsonProperty
    public int[] areaChangesToInclude;

    public ScenarioCopyOptions() {}

    public ScenarioCopyOptions(ScenarioArea area, ScenarioSplitOptions options) {
        name = "%s - %s".formatted(options.batchName(), area.getName());
        includeScenarioChanges = options.applyScenarioChanges();
        areaChangesToInclude = new int[0];
    }
}
