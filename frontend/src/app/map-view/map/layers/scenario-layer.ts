import { Directive } from '@angular/core';
import VectorSource from 'ol/source/Vector';
import { GeoJSON } from 'ol/format';
import VectorLayer from 'ol/layer/Vector';
import { Feature } from 'ol';
import { BandChange } from '@data/metadata/metadata.interfaces';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { AreaStyle } from '@src/app/map-view/map/layers/area-layer';
import { ChangesProperty, Scenario } from '@data/scenario/scenario.interfaces';
import { Fill, Stroke, Style } from 'ol/style';
import { GeoJSONFeature } from 'ol/format/GeoJSON';
import { Coordinate } from 'ol/coordinate';
import { environment } from '@src/environments/environment';
import { convertMultiplierToPercent } from '@data/metadata/metadata.selectors';
import { ScenarioService } from '@data/scenario/scenario.service';
import { MultiPolygon, Polygon, SimpleGeometry } from "ol/geom";

// Move to environment?
export enum ChangeState {
  Red = 'rgba(255, 100, 100, 0.4)',
  Green = 'rgba(100, 255, 100, 0.3)',
  Yellow = 'rgba(255, 255, 100, 0.4)',
  Transparent = 'rgba(0, 0, 0, 0)'
}

const SCENARIO_BOUNDARY_STYLE = new Style({
  stroke: new Stroke({
    width: 4,
    color: 'yellow',
    lineDash: [10],
    lineDashOffset: 8
  })
});

const THE_EMPTY_STYLE = new Style({}); // This style will cause the feature to not be visible

@Directive()
export class ScenarioLayer extends VectorLayer<VectorSource> {

  private boundaryFeature?: Feature;
  private readonly format: GeoJSON;

  constructor(
    private scenarioService: ScenarioService,
    featureProjection: string,
    private store: Store<State>
  ) {
    super({
      source: new VectorSource({
        format: new GeoJSON({
          featureProjection: featureProjection
        })
      }),
      style: new AreaStyle(false)
    });
    this.format = this.getSource()?.getFormat() as GeoJSON;

    this.set('name', 'Scenario Layer'); // for debugging only

    this.scenarioService.setScenarioLayer(this);
  }

  setScenarioBoundary(scenario: Scenario) {
    const boundary = new Feature(this.format);
    let poly: MultiPolygon | undefined;

    // TODO remove whole scenario layer when exiting scenario and create new one upon entering -- immutable
    scenario.areas.forEach(a => {
      const feature = this.format.readFeature(a.feature),
            featurePoly = feature.getGeometry() as SimpleGeometry,
            isSingle = featurePoly.getType() === 'Polygon';
      if(!poly) {
        poly = isSingle ? new MultiPolygon([featurePoly as Polygon]) : featurePoly as MultiPolygon;
      } else {
        if(isSingle) {
          poly.appendPolygon(featurePoly as Polygon);
        } else {
          for (const innerPolygon of (featurePoly as MultiPolygon).getPolygons()) {
            poly.appendPolygon(innerPolygon as Polygon);
          }
        }
      }
      this.getSource()?.addFeature(feature);
    });

    if(poly) {
      boundary.setGeometry(poly);
      this.getSource()?.addFeature(boundary);
      boundary.setStyle(SCENARIO_BOUNDARY_STYLE);
      this.boundaryFeature = boundary;
    }
  }

  // Fast-path for adding existing feature changes */
  addScenarioChangeAreas(changes: ChangesProperty) {
    if (changes) {

      if (environment.map.colorCodeIntensityChanges) {

        this.getColorCodedStyle(Object.values(changes));

        //this.getSource()?.addFeatures(features);
      }
    }
  }

  // TODO override fill style
  getColorCodedStyle(bandChanges: BandChange[]) {
    return new Style({
      stroke: new Stroke({
        // TODO get from AreaStyle
        color: 'black',
        width: 2
      }),
      fill: new Fill({
        color: ScenarioLayer.classifyBandChanges(bandChanges)
      })
    });
  }

  // Yellow is default
  // Red: every intensity change is positive
  // Green: every intensity change is negative
  static classifyBandChanges(bandChanges: BandChange[]) {
    if (
      bandChanges.every(
        bandChange =>
          (bandChange.multiplier ? convertMultiplierToPercent(bandChange.multiplier) < 0 : true) &&
          (bandChange.offset ? bandChange.offset < 0 : true)
      )
    )
      return ChangeState.Green;
    // only decreases
    else if (
      bandChanges.every(
        bandChange =>
          (bandChange.multiplier ? convertMultiplierToPercent(bandChange.multiplier) > 0 : true) &&
          (bandChange.offset ? bandChange.offset > 0 : true)
      )
    )
      return ChangeState.Red;
    // only increases
    else if (
      bandChanges.every(
        bandChange =>
          (bandChange.multiplier
            ? convertMultiplierToPercent(bandChange.multiplier) === 0
            : true) && (bandChange.offset ? bandChange.offset === 0 : true)
      )
    )
      return ChangeState.Transparent;
    else return ChangeState.Yellow; // mixed changes
  }

  hasActiveScenario() {
    return this.boundaryFeature !== undefined;
  }

  getBoundaryFeature() {
    return this.boundaryFeature;
  }

  isPointInsideScenario(coord: Coordinate): boolean {
    return !!(
      this.boundaryFeature && this.boundaryFeature.getGeometry()?.intersectsCoordinate(coord)
    );
  }

  isScenarioActiveAndPointOutsideScenario(coord: Coordinate): boolean {
    return (
      !this.boundaryFeature || !this.boundaryFeature.getGeometry()?.intersectsCoordinate(coord)
    );
  }

  clearLayers() {
    this.getSource()?.clear();
    this.boundaryFeature = undefined;
  }

  /** @return true if feature is now visible, false otherwise */
  public toggleChangeAreaVisibility(feature: GeoJSONFeature) {
    const f = this.getSource()?.getFeatureById(feature.id!);
    if (!f) {
      return;
    }
    const hasEmptyStyle = f.getStyle() === THE_EMPTY_STYLE;
    const isVisible = !hasEmptyStyle;

    if (isVisible) ScenarioLayer.hideFeature(f);
    else f.setStyle(this.getColorCodedStyle(Object.values(feature.properties!['changes'])));

    return !isVisible;
  }

  private static hideFeature(f: Feature) {
    f.setStyle(THE_EMPTY_STYLE);
  }
}
