package se.havochvatten.symphony.scenario;

import javax.persistence.Entity;

@Entity
public class ScenarioSnapshot extends Scenario {
    public ScenarioSnapshot() {}

    public static ScenarioSnapshot makeSnapshot(Scenario s) {
        var snapshot = new ScenarioSnapshot();

        snapshot.id = null;
        snapshot.owner = s.owner;
        snapshot.timestamp = s.timestamp;
        snapshot.baselineId = s.baselineId;
        snapshot.name = s.name;
        snapshot.feature = s.feature;
        snapshot.changes = s.changes;
        snapshot.ecosystemsToInclude = s.ecosystemsToInclude;
        snapshot.pressuresToInclude = s.pressuresToInclude;
        snapshot.matrix = s.matrix;
        snapshot.normalization = s.normalization;
        snapshot.latestCalculation = s.latestCalculation;

        return snapshot;
    }
}
