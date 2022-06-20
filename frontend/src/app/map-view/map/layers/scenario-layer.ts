import { OnDestroy } from "@angular/core";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import VectorLayer from "ol/layer/Vector";
import { Subscription } from "rxjs";
import { Feature } from "ol";
import { BandChange } from "@data/metadata/metadata.interfaces";
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";
import { AreaStyle } from "@src/app/map-view/map/layers/area-layer";
import { ScenarioSelectors } from "@data/scenario";
import { isNotNullOrUndefined } from "@src/util/rxjs";
import { ChangesProperty, Scenario } from "@data/scenario/scenario.interfaces";
import { Fill, Stroke, Style } from "ol/style";
import { GeoJSONFeature, GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { Coordinate } from "ol/coordinate";
import { environment } from "@src/environments/environment";
import { convertMultiplierToPercent } from "@data/metadata/metadata.selectors";
import { ScenarioService } from "@data/scenario/scenario.service";

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

export class ScenarioLayer extends VectorLayer implements OnDestroy {
  // Two layers? One for total area, one for features part of scenario? (need to be able to highlight active
  // sub-feature)
  private activeFeatureSub: Subscription;
  private boundaryFeature?: Feature;
  private format: GeoJSON;

  constructor(private scenarioService: ScenarioService,
              private featureProjection: string,
              private store: Store<State>) {
    super({
      source: new VectorSource( { format: new GeoJSON({
          featureProjection: featureProjection
        })
      }),
      style: new AreaStyle(false),
    });
    this.format = this.getSource().getFormat() as GeoJSON;

    this.set('name','Scenario Layer'); // for debugging only

    this.activeFeatureSub = this.store.select(ScenarioSelectors.selectActiveFeature).pipe(
      isNotNullOrUndefined()
    ).subscribe(f => this.addOrChangeColorCodedFeature(f));

    this.scenarioService.setScenarioLayer(this);
  }

  setScenarioBoundary(scenario: Scenario) {
    // TODO remove whole scenario layer when exiting scenario and create new one upon entering -- immutable
    const feature = this.format.readFeature(scenario.feature);
    feature.setId(undefined); // So as not to find it when using getFeatureById for locating change areas
    feature.unset('id');
    this.boundaryFeature = feature;
    feature.setStyle(SCENARIO_BOUNDARY_STYLE);
    this.getSource().addFeature(feature); // TODO: Add this in a separate layer part of a scenario group
  }

  // Fast-path for adding existing feature changes */
  addScenarioChangeAreas(changes: GeoJSONFeatureCollection) {
    const features = this.format.readFeatures(changes);

    if (environment.map.colorCodeIntensityChanges)
      features
        // .filter(olFeature => olFeature.get("visible"))
        .forEach(olFeature => {
          const bandChanges = Object.values(olFeature.getProperties()['changes']) as BandChange[];
          const colorCodedStyle = this.getColorCodedStyle(bandChanges);
          olFeature.setStyle(colorCodedStyle);
      });

    this.getSource().addFeatures(features);
  }

  addOrChangeColorCodedFeature(feature: GeoJSONFeature) {
    const bandChanges = Object.values(feature.properties!['changes'] as ChangesProperty);

    const olFeature = this.getSource().getFeatureById(feature.id!);
    if (olFeature !== null) {
      if (environment.map.colorCodeIntensityChanges)
        // FIXME add borders
        olFeature.setStyle(this.getColorCodedStyle(bandChanges));
    } else {
      const newOlFeature = this.format.readFeature(feature);

      if (environment.map.colorCodeIntensityChanges)
        newOlFeature.setStyle(this.getColorCodedStyle(bandChanges));

      this.getSource().addFeature(newOlFeature);
    }
  }

  // TODO override fill style
  getColorCodedStyle(bandChanges: BandChange[]) {
    return new Style({
      stroke: new Stroke({  // TODO get from AreaStyle
        color: 'black',
        width: 2,
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
    if (bandChanges.every(bandChange =>
      (bandChange.multiplier ? convertMultiplierToPercent(bandChange.multiplier)<0 : true) &&
      (bandChange.offset ? bandChange.offset<0 : true)))
      return ChangeState.Green; // only decreases
    else if (bandChanges.every(bandChange =>
      (bandChange.multiplier ? convertMultiplierToPercent(bandChange.multiplier)>0 : true) &&
      (bandChange.offset ? bandChange.offset>0 : true)))
      return ChangeState.Red; // only increases
    else if (bandChanges.every(bandChange =>
      (bandChange.multiplier ? convertMultiplierToPercent(bandChange.multiplier) === 0 : true) &&
      (bandChange.offset ? bandChange.offset === 0 : true)))
      return ChangeState.Transparent;
    else
      return ChangeState.Yellow; // mixed changes
  }

  hasActiveScenario() {
    return this.boundaryFeature !== undefined;
  }

  getBoundaryFeature() {
    return this.boundaryFeature;
  }

  isPointInsideScenario(coord: Coordinate) {
    return this.boundaryFeature &&
      this.boundaryFeature.getGeometry().intersectsCoordinate(coord);
  }

  isScenarioActiveAndPointInsideScenario(coord: Coordinate) {
    return !this.boundaryFeature ||
      this.boundaryFeature.getGeometry().intersectsCoordinate(coord);
  }

  clearLayers() {
    this.getSource().clear();
    this.boundaryFeature = undefined;
  }

  public removeScenarioChangeFeature(id: string|number) {
    const toBeRemoved = this.getSource().getFeatureById(id);
    if (toBeRemoved)
      this.getSource().removeFeature(toBeRemoved);
    else
      console.error('Unable to find feature for removal, id=', id);
  }

  /** @return true if feature is now visible, false otherwise */
  public toggleChangeAreaVisibility(feature: GeoJSONFeature) {
    const f = this.getSource().getFeatureById(feature.id!);
    const hasEmptyStyle = f.getStyle() === THE_EMPTY_STYLE;
    const isVisible = !hasEmptyStyle;

    if (isVisible)
      ScenarioLayer.hideFeature(f);
    else
      f.setStyle(this.getColorCodedStyle(Object.values(feature.properties!['changes'])));

    return !isVisible;
  }

  public hideChangeAreas() {
    this.getSource().getFeatures().filter(f => f !== this.boundaryFeature)
      .map(ScenarioLayer.hideFeature);
  }

  private static hideFeature(f: Feature) {
    f.setStyle(THE_EMPTY_STYLE);
  }

  ngOnDestroy(): void {
    this.activeFeatureSub.unsubscribe();
  }
}
