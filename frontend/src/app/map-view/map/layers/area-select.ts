import { Select } from "ol/interaction";
import * as condition from "ol/events/condition";
import { turfIntersects as intersects } from "@shared/turf-helper/turf-helper";
import { getFeaturesByStatePaths } from "@src/util/ol";
import AreaLayer, { AreaStyle } from "@src/app/map-view/map/layers/area-layer";

export class AreaSelect extends Select {

  constructor(areaLayer: AreaLayer) {
    const scenarioLayer = areaLayer.scenarioLayer;
    super({
      style: new AreaStyle(true),
      layers: [areaLayer, scenarioLayer],
      toggleCondition: event => event.originalEvent.ctrlKey,
      condition: event => {
        return (
          condition.singleClick(event) &&
          scenarioLayer.isScenarioActiveAndPointOutsideScenario(event.coordinate)
        );
      },
      filter: (feature, layer) => {
        if(scenarioLayer.getBoundaryFeature()) {
          if (feature === scenarioLayer.getBoundaryFeature()) return false; // don't allow selection of whole scenario for now
          if (intersects(feature, scenarioLayer.getBoundaryFeature()!)) return false; // don't allow selection of features inside scenario
        }

        const source = scenarioLayer.getSource();
        return !(layer === areaLayer &&
          source &&
          getFeaturesByStatePaths(source, [feature.get('statePath')]));
      }
    });
  }
}
