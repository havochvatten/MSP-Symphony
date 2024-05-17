import { Collection, Map as OLMap, MapBrowserEvent, Overlay } from 'ol';
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
import { turfIntersects as intersects } from "@shared/turf-helper/turf-helper";
import { Geometry } from "ol/geom";
import { DrawEvent } from "ol/interaction/Draw";
import { simpleHash, statePathContains } from "@shared/common.util";
import { AreaSelect } from "@src/app/map-view/map/layers/area-select";

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
  private readonly drawAreaInteraction: DrawAreaInteraction;
  private readonly boundaryLayer: VectorLayer<VectorSource>;
  private readonly areaSelect: AreaSelect;
  private drawInteractionActive = false;
  private boundaries?: FeatureLike[];
  private optionsMenuActive = false;
  private featureMap = new Map<string, Feature<Geometry>>();
  private selectedFeatures = new Collection<Feature<Geometry>>();
  private selectedStyle = new AreaStyle(true);

  constructor(
    private map: OLMap,
    public readonly setSelection: (statePath: StatePath | undefined, expand: boolean) => void,
    private readonly zoomToExtent: (extent: Extent, duration: number) => void,
    private onDrawEnd: (polygon: Polygon)=> void,
    private onDrawInvalid: () => void,
    private onDownloadClick: (path: string) => void,
    onSplitClick: (feature: Feature, prevFeature: Feature) => void,
    onMergeClick: (features: Feature[]) => void,
    public scenarioLayer: ScenarioLayer,
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
    this.addRightClickInteraction(map);
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
    this.areaSelect = new AreaSelect(this);

    this.map.addInteraction(this.areaSelect);

    this.areaSelect.on('select', (event) => {

      const feature = event.selected[0],
        features = this.areaSelect.getFeatures();
      if (feature !== undefined) {
        // Merge or split (Alt key pressed)
        if (event.mapBrowserEvent.originalEvent.altKey) {
          if (event.mapBrowserEvent.originalEvent.shiftKey) {
            features.extend(event.deselected);
            onMergeClick(features.getArray());
          } else if (event.deselected[0]) {
            onSplitClick(feature, event.deselected[0]);
          }
        }
      }

      // Ctrl + click expands selection
      this.setSelection(event.selected[0]?.get('statePath') || undefined,
                         event.mapBrowserEvent.originalEvent.ctrlKey);
    });
  }

  private async addHoverInteraction(map: OLMap, areaLayer: VectorLayer<VectorSource>) {
    const container = document.getElementById('popup') as HTMLElement;
    const content = document.getElementById('popup-title') as HTMLElement;
    const body = document.getElementById('popup-body') as HTMLElement;
    const overlay = new Overlay({
      id: 'hoverInfo',
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
      if(this.optionsMenuActive) return;

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

  private addRightClickInteraction(map: OLMap) {
    let path = '';
    const
      optionsMenuElement = document.getElementById('area-options-menu')!,
      removeOptionsMenu = () => {
        this.optionsMenuActive = false;
        map.getOverlayById('areaOptionsMenu')?.setPosition(undefined);
        path = '';
      },
      options_overlay = new Overlay({
        id: 'areaOptionsMenu',
        element: optionsMenuElement,
        stopEvent: false,
        autoPan: false,
        insertFirst: false
      });

    map.addOverlay(options_overlay);

    map.getViewport().addEventListener('contextmenu', (event) => {
      const features = map.getFeaturesAtPixel(map.getEventPixel(event));

      if (features.length > 0) {
        path = features[0].get('statePath').join(',');
        if (path) {
          map.getOverlayById('hoverInfo')?.setPosition(undefined);
          options_overlay.setPosition(map.getEventCoordinate(event));
          this.optionsMenuActive = true;
          event.preventDefault();
        }
      }
    });

    optionsMenuElement.addEventListener('mouseleave', removeOptionsMenu);

    optionsMenuElement.addEventListener('click', (event) => {
      if(path !== '') {
        this.onDownloadClick(path);
      }
      removeOptionsMenu();
    });
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

    if(boundaries.some(boundary => {
        return intersects(testFeature, boundary as Feature<Geometry>)
    })) {
      this.onDrawEnd(polygon);
    } else {
      this.onDrawInvalid();
    }
  }

  setVisibleAreas(visible: StatePath[], selected: StatePath[] | undefined) {
    const source = this.getSource();
    if (!source || !visible) {
      return;
    }
    source.clear();

    for(const statePath of visible) {
      const feature = this.featureMap.get(simpleHash(statePath));
      if(feature) {
        if (selected && statePathContains(statePath, selected)) {
          feature.setStyle(this.selectedStyle);
        }
        source.addFeature(feature);
      }
    }
  }

  mapAreaFeatures(featureCollections: FeatureCollection[]) {
    for(const featureCollection of featureCollections) {
      for(const feature of featureCollection.features) {
        const gFeature = this.geoJson.readFeature(feature);
        this.featureMap.set(simpleHash(gFeature.get('statePath')), gFeature);
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
    this.areaSelect.getFeatures().clear();
    this.setSelection(undefined, false);
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
