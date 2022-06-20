import { Map as OLMap, MapBrowserEvent, Overlay } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Feature, { FeatureLike } from 'ol/Feature';
import { Draw, Select, Snap } from 'ol/interaction';
import { Fill, Stroke, Style } from 'ol/style';
import GeometryType from 'ol/geom/GeometryType';
import Point from 'ol/geom/Point';
import { Coordinate } from 'ol/coordinate';
import { FeatureCollection, Polygon, StatePath } from '@data/area/area.interfaces';
import { Extent, getCenter } from 'ol/extent';
import * as condition from "ol/events/condition";
import { getFeatureByStatePath } from "@src/util/ol";
import { ScenarioLayer } from "@src/app/map-view/map/layers/scenario-layer";
import { TranslateService } from "@ngx-translate/core";

// const boundaryStyle = new Style({
//   stroke: new Stroke({
//     width: 4,
//     color: 'yellow',
//     lineDash: [1, 5]
//   })
// });

function unique<T>(value: T, index: number, self: T[]) {
  return self.indexOf(value) === index;
}

function getPolygon(feature: Feature): Polygon {
  const geometry: Point = <Point>feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');
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
    condition: (event: MapBrowserEvent) => boolean,
    onDrawEnd: (polygon: Polygon) => Polygon | void
  ) {
    super({
      source: source,
      type: GeometryType.POLYGON,
      condition
    });
    const snap = new Snap({
      source: source
    });
    map.addInteraction(snap);

    this.on('drawend', (event: any) => {
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

class AreaLayer extends VectorLayer {
  private onClickInteraction: Select;
  private drawAreaInteraction: DrawAreaInteraction;
  private drawInteractionActive = false;
  private boundaryLayer: VectorLayer;
  private boundaries?: FeatureLike[];
  private geoJson: GeoJSON;

  constructor(
    private map: OLMap,
    private setSelection: (feature?: Feature) => void,
    private zoomToExtent: (extent: Extent, duration: number) => void,
    onDrawEnd = (polygon: Polygon) => {},
    private scenarioLayer: ScenarioLayer,
    private translateService: TranslateService
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
      this.checkDrawCondition,
      onDrawEnd
    );
    this.geoJson = new GeoJSON({
      featureProjection: map.getView().getProjection()
    });

    this.onClickInteraction = new class extends Select {
      constructor(that: AreaLayer) {
        super({
          style: new AreaStyle(true),
          layers: [that, scenarioLayer],
          condition: (event) => {
            return condition.singleClick(event) &&
              that.scenarioLayer.isScenarioActiveAndPointInsideScenario(event.coordinate);
          },
          filter: (feature, layer) => {
            console.debug('filter', feature.get('title') ?? feature.get('id'), layer.get('name'));
            if (feature === that.scenarioLayer.getBoundaryFeature())
              return false; // don't allow selection of whole scenario for now

            if (layer === that && getFeatureByStatePath(that.scenarioLayer.getSource(), feature.get('statePath'))) {
              console.debug("Preventing double selection since feature exists in scenario")
              return false;
            }
            else {
              return true;
            }
          }
        });
        this.on('select', event => {
          const feature = event.selected[0];
          if (feature !== undefined)
            console.log('dispatching selection '+feature.get('id'));
          that.setSelection(feature);
        });
      }
    }(this);

    this.map.addInteraction(this.onClickInteraction);
  }

  private async addHoverInteraction(map: OLMap, areaLayer: VectorLayer) {
    const container = document.getElementById('popup') as HTMLElement;
    const content = document.getElementById('popup-title') as HTMLElement;
    const body = document.getElementById('popup-body') as HTMLElement;
    const overlay = new Overlay({
      element: container,
      stopEvent: false,
      autoPan: false
    });
    map.addOverlay(overlay);

    const { 'map.click-area': clickArea, 'map.location-outside-scenario': pointOutsideScenario } =
      await this.translateService.get(['map.click-area', 'map.location-outside-scenario']).toPromise();
    map.on('pointermove', event => {
      const detectedFeatures = map.getFeaturesAtPixel(event.pixel);
      const hit = detectedFeatures.length>0;

      if (hit) {
        map.getTargetElement().style.cursor = 'pointer';

        content.innerHTML = detectedFeatures
          .map(f => f.get('displayName') ?? f.get('title'))
          .filter(name => name !== undefined)
          .filter(unique) // scenario layer can contain duplicated feature
          .join(', ');

        if (!this.scenarioLayer.hasActiveScenario())
          body.innerText = clickArea;
        else {
          if (this.scenarioLayer.isPointInsideScenario(event.coordinate))
            body.innerText = clickArea;
          else
            body.innerText = pointOutsideScenario;
        }

        // FIXME index 0 is not always correct (can contain scenario layer)
        overlay.setPosition(getCenter(detectedFeatures[0].getGeometry().getExtent()));
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

  private checkDrawCondition = (event: MapBrowserEvent) => {
    if (this.boundaries) {
      const boundaryGeometries = <Point[]>this.boundaries.map(feature => feature.getGeometry());
      const drawnPointCoordinate = event.coordinate;
      const drawnCoordinates = [...this.drawAreaInteraction.getCoordinates(), drawnPointCoordinate];
      for (const boundary of boundaryGeometries) {
        const isInsideBoundary = drawnCoordinates.every(geometry => boundary.intersectsCoordinate(geometry));
        if (isInsideBoundary) {
          this.drawAreaInteraction.addCoordinate(drawnPointCoordinate);
          return true;
        }
      }
      return false;
    } else
      return true;
  };

  // FIXME: This is called each time an area is selected!
  setAreaLayers(
    featureCollections: FeatureCollection[],
    selected: StatePath | undefined
  ) {
    this.getSource().clear();
    // TODO: The different kinds of areas should probably go to different layers, so we do not need to read them
    //  all after an area group visibility change...
    featureCollections.forEach((featureCollection: FeatureCollection) =>
      this.getSource().addFeatures(this.geoJson.readFeatures(featureCollection)));

    if (selected) {
      const feature = getFeatureByStatePath(this.getSource(), selected);
      if (feature)
        this.onClickInteraction.getFeatures().push(feature);
    }
  }

  setBoundaries(boundaryCollection: FeatureCollection) {
    const source = this.boundaryLayer.getSource();
    source.clear();
    source.addFeatures(this.geoJson.readFeatures(boundaryCollection));
    this.boundaries = source.getFeatures();
  }

  zoomToArea(statePath: StatePath) {
    // The below is pretty expensive (linear search), we would like to make use of getFeatureById instead...
    const f = getFeatureByStatePath(this.getSource(), statePath);
    return this.zoomToExtent(f!.getGeometry().getExtent(), 1000), true;
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
}

class BoundaryLayer extends VectorLayer {
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
