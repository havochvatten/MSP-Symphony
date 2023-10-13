package se.havochvatten.symphony.scenario;

public class ScenarioCopyOptions {
    public String name;
    public boolean includeScenarioChanges;
    public int[] areaChangesToInclude;

    public ScenarioCopyOptions(ScenarioArea area, ScenarioSplitOptions options) {
        name = "%s - %s".formatted(options.batchName(), area.getFeature().getProperty("name").getValue().toString());
        includeScenarioChanges = options.applyScenarioChanges();
        areaChangesToInclude = new int[0];
    }
}
