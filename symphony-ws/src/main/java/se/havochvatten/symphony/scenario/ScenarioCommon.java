package se.havochvatten.symphony.scenario;

import org.locationtech.jts.geom.Geometry;

import java.util.Map;

public interface ScenarioCommon {
    Geometry getGeometry();
    Map<Integer, Integer> getAreasExcludingCoastal();
}
