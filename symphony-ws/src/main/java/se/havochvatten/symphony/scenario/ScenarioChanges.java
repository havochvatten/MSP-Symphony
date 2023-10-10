package se.havochvatten.symphony.scenario;
import java.util.Map;

public record ScenarioChanges (Map<String, BandChange> baseChanges, Map<Integer, Map<String, BandChange>> areaChanges ) {}
