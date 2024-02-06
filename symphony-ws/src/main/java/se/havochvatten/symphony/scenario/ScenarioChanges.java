package se.havochvatten.symphony.scenario;
import se.havochvatten.symphony.dto.LayerType;

import java.util.Map;

public record ScenarioChanges (Map<LayerType, Map<Integer, BandChange>> baseChanges,
                               Map<Integer, Map<LayerType, Map<Integer, BandChange>>> areaChanges ) {}
