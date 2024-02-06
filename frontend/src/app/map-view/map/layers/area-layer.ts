import { Map as OLMap, MapBrowserEvent, Overlay } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Feature, { FeatureLike } from 'ol/Feature';
import { Draw, Select, Snap } from 'ol/interaction';
import { Fill, Stroke, Style } from 'ol/style';
import Point from 'ol/geom/Point';
import { Coordinate } from 'ol/coordinate';
import { FeatureCollection, Polygon, StatePath } from '@data/area/area.interfaces';
import { Extent, getCenter } from 'ol/extent';
import * as condition from 'ol/events/condition';
import { getFeaturesByStatePaths } from '@src/util/ol';
import { ScenarioLayer } from '@src/app/map-view/map/layers/scenario-layer';
import { TranslateService } from '@ngx-translate/core';
import { isEqual, some } from "lodash";
import { turfIntersects as intersects } from "@shared/turf-helper/turf-helper";
import { Geometry } from "ol/geom";
import { DrawEvent } from "ol/interaction/Draw";

function unique<T>(value: T, index: number, self: T[]) {
  return self.indexOf(value) === index;
}

function getPolygon(feature: Feature): Polygon {
  const geometry: Point = <Point>feature.getGeometry()?.transform('EPSG:3857', 'EPSG:4326');
  return {
    type: 'Polygon',
    coordinates: geometry.getCoordinates()
  };
}

export class AreaStyle extends Style {
  constructor(selected: boolean) {
    super({
      stroke: new Stroke({
        color: selected ? 'black' : 'black',
        width: selected ? 4 : 2
      }),
      fill: new Fill({
        color: selected ? 'rgba(0,0,0,0.4)' : 'transparent'
      })
    });
  }
}

class DrawAreaInteraction extends Draw {
  private coordinates: Coordinate[] = [];

  constructor(
    map: OLMap,
    source: VectorSource,
    drawCondition: (event: MapBrowserEvent<UIEvent>) => boolean,
    onDrawEnd: (polygon: Polygon) => Polygon | void
  ) {
    super({
      source: source,
      // GeometryType.POLYGON is no longer exported ... https://github.com/openlayers/openlayers/issues/5241
      type: 'Polygon',
      condition: drawCondition, // used only for applying side effect accessing internal
                                // coordinate group, condition itself always return true
    });
    const snap = new Snap({
      source: source
    });
    map.addInteraction(snap);

    this.on('drawend', (event: DrawEvent) => {
      //source.addFeature(event.feature);
      this.clearCoordinates();
      onDrawEnd(getPolygon(event.feature));
    });
  }

  addCoordinate(coordinate: Coordinate) {
    this.coordinates.push(coordinate);
  }

  getCoordinates() {
    return this.coordinates;
  }

  clearCoordinates() {
    this.coordinates = [];
  }
}

class AreaLayer extends VectorLayer<VectorSource> {
  private onClickInteraction: Select;
  private drawAreaInteraction: DrawAreaInteraction;
  private drawInteractionActive = false;
  private boundaryLayer: VectorLayer<VectorSource>;
  private boundaries?: FeatureLike[];
  private selectedFeatures: Feature[] = [];

  constructor(
    private map: OLMap,
    private setSelection: (features: Feature[] | undefined, overlap: boolean) => void,
    private zoomToExtent: (extent: Extent, duration: number) => void,
    private onDrawEnd: (polygon: Polygon)=> void,
    private onDrawInvalid: () => void,
    onSplitClick: (feature: Feature, prevFeature: Feature) => void,
    onMergeClick: (features: Feature[]) => void,
    private scenarioLayer: ScenarioLayer,
    private translateService: TranslateService,
    private geoJson: GeoJSON
  ) {
    super({
      source: new VectorSource({ format: new GeoJSON() }),
      style: new AreaStyle(false)
    });
    this.set('name', 'Area Layer');

    this.setSelection = setSelection;
    this.zoomToExtent = zoomToExtent;
    this.addHoverInteraction(map, this);
    this.boundaryLayer = new BoundaryLayer();
    this.drawAreaInteraction = new DrawAreaInteraction(
      map,
      new VectorSource({ format: new GeoJSON() }),
      this.appendCoordinates,
      (polygon) => {
        if(this.boundaries) { this.checkPolygon(polygon, this.boundaries) }
        else { this.onDrawEnd(polygon); }
      }
    );


    this.onClickInteraction = new (class extends Select {
      constructor(that: AreaLayer) {
        super({
          style: new AreaStyle(true),
          layers: [that, scenarioLayer],
          condition: event => {
            return (
              condition.singleClick(event) &&
              that.scenarioLayer.isScenarioActiveAndPointOutsideScenario(event.coordinate)
            );
          },
          filter: (feature, layer) => {
            if(that.scenarioLayer.getBoundaryFeature()) {
              if (feature === that.scenarioLayer.getBoundaryFeature()) return false; // don't allow selection of whole scenario for now
              if (intersects(feature, that.scenarioLayer.getBoundaryFeature()!)) return false; // don't allow selection of features inside scenario
            }
            const source = that.scenarioLayer.getSource();
            return !(layer === that &&
              source &&
              getFeaturesByStatePaths(source, [feature.get('statePath')]));
          }
        });
        this.on('select', event => {
          const feature = event.selected[0];
          if (feature !== undefined) {
            // Merge or split (Alt key pressed)
            if (event.mapBrowserEvent.originalEvent.altKey) {
              if (event.mapBrowserEvent.originalEvent.shiftKey) {
                onMergeClick([feature, ...that.selectedFeatures]);
              } else if (that.selectedFeatures.length === 1) {
                onSplitClick(feature, that.selectedFeatures[0]);
              }
            } else {
              // Expand selection (Ctrl key pressed)
              if (event.mapBrowserEvent.originalEvent.ctrlKey) {
                if (that.selectedFeatures.includes(feature)) {
                  that.selectedFeatures = that.selectedFeatures.filter(f => !isEqual(feature.getGeometry(), f.getGeometry()));
                } else {
                  that.selectedFeatures.push(feature);
                }
              // Select single feature
              } else {
                that.selectedFeatures = [feature];
              }
            }
          } else  {
            if(event.deselected.length > 0) { // may indicate click within selected area, ctrl+click deselects
              const clickedFeature = that.map.getFeaturesAtPixel(event.mapBrowserEvent.pixel)[0];
              if(clickedFeature) {
                  that.selectedFeatures = event.mapBrowserEvent.originalEvent.ctrlKey ?
                    that.selectedFeatures.filter(f => clickedFeature.get('statePath') !== f.get('statePath')) :
                    that.selectedFeatures.filter(f => clickedFeature.get('statePath') === f.get('statePath'))
              }
            } else {
              that.selectedFeatures = [];
            }
          }
          that.setSelection(that.selectedFeatures, that.checkOverlap());
        });
      }
    })(this);

    this.map.addInteraction(this.onClickInteraction);
  }

  private checkOverlap(): boolean {
    for(const f of this.selectedFeatures) {
      for(const f2 of this.selectedFeatures) {
        if(f !== f2 && intersects(f, f2)) {
          return true;
        }
      }
    }
    return false;
  }

  private async addHoverInteraction(map: OLMap, areaLayer: VectorLayer<VectorSource>) {
    const container = document.getElementById('popup') as HTMLElement;
    const content = document.getElementById('popup-title') as HTMLElement;
    const body = document.getElementById('popup-body') as HTMLElement;
    const overlay = new Overlay({
      element: container,
      stopEvent: false,
      autoPan: false
    });
    map.addOverlay(overlay);

    const {
      'map.click-area': clickArea,
      'map.location-within-scenario': pointWithinScenario
    } = await this.translateService
      .get(['map.click-area', 'map.location-within-scenario'])
      .toPromise();
    map.on('pointermove', event => {
      const detectedFeatures = map.getFeaturesAtPixel(event.pixel);
      const hit = detectedFeatures.length > 0;

      if (hit) {
        map.getTargetElement().style.cursor = 'pointer';

        content.innerHTML = detectedFeatures
          .map(f => f.get('displayName') ?? f.get('title'))
          .filter(name => name !== undefined)
          .filter(unique) // scenario layer can contain duplicated feature
          .join(', ');

        const hoveredFeature = (detectedFeatures[0] as Feature);

        if (!this.scenarioLayer.hasActiveScenario()) body.innerText = clickArea;
        else {
          if (this.scenarioLayer.isPointInsideScenario(event.coordinate) ||
              intersects(this.scenarioLayer.getBoundaryFeature()!, hoveredFeature))
            body.innerText = pointWithinScenario;
          else body.innerText = clickArea;
        }

        const extent = hoveredFeature.getGeometry()?.getExtent();
        if (extent) {
          overlay.setPosition(getCenter(extent));
        }
      } else {
        map.getTargetElement().style.cursor = '';
        overlay.setPosition(undefined);
      }
    });
    const areaHover = new Select({
      condition: condition.pointerMove,
      layers: [areaLayer, this.scenarioLayer],
      style: new Style({
        stroke: new Stroke({
          width: 3,
          color: 'black'
        }),
        fill: new Fill({
          color: 'rgba(0,0,0,0.2)'
        })
      })
    });
    map.addInteraction(areaHover);
  }

  private appendCoordinates = (event: MapBrowserEvent<UIEvent>) => {
    this.drawAreaInteraction.addCoordinate(event.coordinate);
    return true;
  };

  private checkPolygon(polygon: Polygon, boundaries: FeatureLike[]) {
    const testFeature = new GeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: this.map.getView().getProjection()
    }).readFeature(polygon);

    if(some(boundaries, boundary => {
        return intersects(testFeature, boundary as Feature<Geometry>)
    })) {
      this.onDrawEnd(polygon);
    } else {
      this.onDrawInvalid();
    }
  }

  // FIXME: This is called each time an area is selected!
  setAreaLayers(featureCollections: FeatureCollection[], selected: StatePath[] | undefined) {
    const source = this.getSource();
    if (!source) {
      return;
    }
    source.clear();
    // TODO: The different kinds of areas should probably go to different layers, so we do not need to read them
    //  all after an area group visibility change...
    featureCollections.forEach((featureCollection: FeatureCollection) =>
      source.addFeatures(this.geoJson.readFeatures(featureCollection))
    );

    if (selected) {
      const features = getFeaturesByStatePaths(source, selected);
      if (features) {
        for(const f of features) {
          this.onClickInteraction.getFeatures().push(f);
        }
      }
    }
  }

  setBoundaries(boundaryCollection: FeatureCollection) {
    const source = this.boundaryLayer.getSource();
    if (!source) {
      return;
    }
    source.clear();
    source.addFeatures(this.geoJson.readFeatures(boundaryCollection));
    this.boundaries = source.getFeatures();
  }

  zoomToArea(statePath: StatePath[]) {
    // The below is pretty expensive (linear search), we would like to make use of getFeatureById instead...
    const source = this.getSource();
    if (!source) {
      return;
    }

    const geo = getFeaturesByStatePaths(source, statePath);

    if(!geo) {
      return;
    }

    const newSource = new VectorSource({
      format: source.getFormat(),
      features: geo
    });

    return this.zoomToExtent(newSource.getExtent(), 1000), true;
  }

  toggleDrawInteraction(): boolean {
    this.drawAreaInteraction.clearCoordinates();
    if (this.drawInteractionActive) {
      this.map.removeInteraction(this.drawAreaInteraction);
      this.map.removeLayer(this.boundaryLayer);
    } else {
      this.map.addInteraction(this.drawAreaInteraction);
      this.map.addLayer(this.boundaryLayer);
    }
    this.drawInteractionActive = !this.drawInteractionActive;
    return this.drawInteractionActive;
  }

  deselectAreas() {
    this.selectedFeatures = [];
    this.setSelection([], false);
  }
}

class BoundaryLayer extends VectorLayer<VectorSource> {
  constructor() {
    super({
      source: new VectorSource({ format: new GeoJSON() }),
      style: new Style({
        stroke: new Stroke({
          width: 1,
          color: 'black',
          lineDash: [1, 5]
        })
      })
    });
  }
}

export default AreaLayer;
