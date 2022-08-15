import { AfterViewInit, Component, HostListener, Input, NgModuleRef, OnDestroy } from '@angular/core';
import { Coordinate } from 'ol/coordinate';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { MetadataSelectors } from '@data/metadata';
import { AreaActions, AreaSelectors } from '@data/area';
import { Polygon, StatePath } from '@data/area/area.interfaces';
import { CalculationService } from '@data/calculation/calculation.service';
import { StaticImageOptions } from '@data/calculation/calculation.interfaces';
import { DialogService } from '@src/app/shared/dialog/dialog.service';
import { CreateUserAreaModalComponent } from './create-user-area-modal/create-user-area-modal.component';
import { UserSelectors } from "@data/user";
import { ScenarioSelectors } from "@data/scenario";
import { Scenario } from "@data/scenario/scenario.interfaces";
import { distinctUntilChanged, filter, skip } from "rxjs/operators";
import { Feature, Map as OLMap, View } from "ol";
import { isNotNullOrUndefined } from "@src/util/rxjs";
import { TranslateService } from "@ngx-translate/core";
import { ScenarioService } from "@data/scenario/scenario.service";
import { environment as env } from "@src/environments/environment";
import { BackgroundLayer } from "@src/app/map-view/map/layers/background-layer";
import { Attribution, ScaleLine } from "ol/control";
import * as proj from "ol/proj";
import BandLayer from "@src/app/map-view/map/layers/band-layer";
import { ResultLayerGroup } from "@src/app/map-view/map/layers/result-layer-group";
import { ScenarioLayer } from "@src/app/map-view/map/layers/scenario-layer";
import AreaLayer from "@src/app/map-view/map/layers/area-layer";
import { Extent } from "ol/extent";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @Input() mapCenter?: Coordinate;
  drawIsActive = false;

  private map?: OLMap;
  private storeSubscription?: Subscription;
  private areaSubscription?: Subscription;
  private resultSubscription?: Subscription;
  private userSubscription?: Subscription;
  private activeScenario$: Observable<Scenario | undefined>;
  private scenarioSubscription: Subscription;
  private scenarioCloseSubscription: Subscription;

  // layers
  private background?: BackgroundLayer;
  private areaLayer!: AreaLayer;
  private bandLayer?: BandLayer;
  private resultLayerGroup!: ResultLayerGroup;
  private scenarioLayer!: ScenarioLayer;

  constructor(
    private store: Store<State>,
    private calcService: CalculationService,
    private scenarioService: ScenarioService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private http: HttpClient,
    private moduleRef: NgModuleRef<any>
  ) {
    this.userSubscription = this.store        /* TOOD: Just get from static environment?*/
      .select(UserSelectors.selectBaseline).pipe(isNotNullOrUndefined())
      .subscribe((baseline) => {
        this.bandLayer = new BandLayer(baseline.name, http);
        this.map!.getLayers().insertAt(1, this.bandLayer); // on top of background layer
      });

    this.storeSubscription = this.store
      .select(MetadataSelectors.selectVisibleBands)
      .subscribe(components => { // FIXME
        this.bandLayer?.setVisibleBands('ECOSYSTEM', components.ecoComponent);
        this.bandLayer?.setVisibleBands('PRESSURE', components.pressureComponent);
      });

    this.areaSubscription = this.store
      .select(AreaSelectors.selectSelectedFeatureCollections)
      .subscribe(value => {
        if (value && this.map) {
          this.areaLayer.setAreaLayers(value.collections, value.selected);
          this.areaLayer.setBoundaries(value.boundary);
        }
      });

    this.activeScenario$ = this.store.select(ScenarioSelectors.selectActiveScenario);

    this.scenarioSubscription = this.activeScenario$.pipe(
      distinctUntilChanged((prev: Scenario|undefined, curr: Scenario|undefined) => prev?.id === curr?.id),
      isNotNullOrUndefined(),
    ).subscribe((scenario: Scenario) => {
      this.scenarioLayer.clearLayers();

      this.scenarioLayer.setScenarioBoundary(scenario);
      if (scenario.changes)
        this.scenarioLayer.addScenarioChangeAreas(scenario.changes);

      this.zoomToExtent(this.scenarioLayer.getBoundaryFeature()!.getGeometry().getExtent(),
        500);
    });

    this.scenarioCloseSubscription = this.activeScenario$.pipe(
      skip(1), // undefined as always emitted on start, which does indicate a scenario close
      filter(s => s === undefined)
    ).subscribe(_ => {  // A scenario was closed
      // TODO: Remove result layer if loadResultLayerOnOpen is true
      this.scenarioLayer.clearLayers();
      this.zoomOut(); // visual cue that scenario has been exited
    });

    // Use store instead?
    this.resultSubscription = this.calcService.resultReady$.subscribe((result: StaticImageOptions) => {
      this.resultLayerGroup.addResult(result);
    });
  }

  ngAfterViewInit() {
    if (!env.map.disableBackgroundMap)
      this.background = new BackgroundLayer('OpenSeaMap');

    // TODO useGeographic function in the ‘ol/proj’?
    this.map = new OLMap({
      target: 'map',
      controls: [
        new ScaleLine({
          units: 'metric',
          // Not present in d.ts file for some reason
          //bar: true,
          //steps: 4,
          //text: true,
          minWidth: 140,
          target: document.getElementById('scale-container') as HTMLElement
        }),
        new Attribution({
          collapsible: false
        })
      ],
      layers: this.background ? [this.background] : [],
      view: new View({
        center: proj.fromLonLat(this.mapCenter!),
        zoom: 6,
        maxZoom: env.map.maxZoom,
        minZoom: 3,
        // Web Mercator is Open Layers default (like OSM). Use EPSG:4326 instead?
        // projection: proj.get(AppSettings.MAP_PROJECTION),
      }),
      pixelRatio: 1 // to fix tile size to 256x256
    });
    this.resultLayerGroup = new ResultLayerGroup();
    this.map.addLayer(this.resultLayerGroup);

    this.scenarioLayer = new ScenarioLayer(this.scenarioService, this.map.getView().getProjection().getCode(), this.store);

    this.areaLayer = new AreaLayer(this.map, this.dispatchSelectionUpdate, this.zoomToExtent, this.onDrawEnd,
      this.scenarioLayer, this.translateService); // Will add itself to the map
    this.map.addLayer(this.areaLayer);

    this.map.addLayer(this.scenarioLayer);
  }
  public clearResult() {
    this.resultLayerGroup.clearResult();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'x' && event.altKey) {
      this.clearResult();
    }
  }

  private dispatchSelectionUpdate = (feature?: Feature) => {
    this.store.dispatch(AreaActions.updateSelectedArea({ statePath: feature?.get('statePath') }));
  };

  ngOnDestroy() {
    if (this.storeSubscription) {
      this.storeSubscription.unsubscribe();
    }
    if (this.areaSubscription) {
      this.areaSubscription.unsubscribe();
    }
    if (this.resultSubscription) {
      this.resultSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

    this.scenarioCloseSubscription.unsubscribe();
    this.scenarioSubscription.unsubscribe();
  }

  toggleDrawInteraction = () => {
    this.drawIsActive = this.areaLayer.toggleDrawInteraction();
  };

  onDrawEnd = async (polygon: Polygon) => {
    const areaName = await this.dialogService.open(CreateUserAreaModalComponent, this.moduleRef);
    if (typeof areaName === 'string') {
      this.toggleDrawInteraction();
      const newArea = {
        name: areaName,
        polygon,
        description: ''
      };
      this.store.dispatch(AreaActions.createUserDefinedArea(newArea));
    }
  }

  public zoomIn() {
    this.setZoom(this.map!.getView().getZoom() + 1);
  };

  public zoomOut() {
    this.setZoom(this.map!.getView().getZoom() - 1);
  };

  private setZoom = (zoomLevel: number, duration = 250, center?: Coordinate) => {
    this.map!.getView().animate({ zoom: zoomLevel, duration }, { center });
  };

  public zoomToArea = (statePath: StatePath) => {
    this.areaLayer.zoomToArea(statePath);
  }

  public zoomToExtent(extent: Extent, duration: number) {
    const padding = env.map.zoomPadding;
    this.map!.getView().fit(extent, {
      padding: [padding, padding, padding, /*40 rem=*/400], // TODO: set last element to width of left side panel, if
      // open
      // TODO observe state of sidebar toggle
      duration,
    });
  }

  public setMapOpacity(opacity: number) {
    // The event object is sometimes emitted when using this function
    // in an input event, which makes the opacity reset to 1
    if (typeof opacity === 'number' && this.background)
      this.background.setOpacity(opacity);
  }
}
