import { AfterViewInit, Component, EventEmitter, HostListener, Input, NgModuleRef, OnDestroy, Output
} from '@angular/core';
import { Coordinate } from 'ol/coordinate';
import { firstValueFrom, Observable, skipWhile, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { v4 as uuid } from 'uuid';
import { State } from '@src/app/app-reducer';
import { MetadataSelectors } from '@data/metadata';
import { AreaActions, AreaSelectors } from '@data/area';
import { UserSelectors } from '@data/user';
import { ScenarioSelectors } from '@data/scenario';
import { MessageActions } from "@data/message";
import { CalculationActions } from "@data/calculation";
import { Polygon, StatePath } from '@data/area/area.interfaces';
import { CalculationService } from '@data/calculation/calculation.service';
import { StaticImageOptions } from '@data/calculation/calculation.interfaces';
import { DialogService } from '@shared/dialog/dialog.service';
import { CreateUserAreaModalComponent } from './create-user-area-modal/create-user-area-modal.component';
import { Scenario } from '@data/scenario/scenario.interfaces';
import { distinctUntilChanged, filter, skip, take } from 'rxjs/operators';
import { Feature, Map as OLMap, View } from 'ol';
import { isNotNullOrUndefined } from '@src/util/rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ScenarioService } from '@data/scenario/scenario.service';
import { environment as env } from '@src/environments/environment';
import { BackgroundLayer } from '@src/app/map-view/map/layers/background-layer';
import { Attribution, ScaleLine } from 'ol/control';
import * as proj from 'ol/proj';
import BandLayer from '@src/app/map-view/map/layers/band-layer';
import { ResultLayerGroup } from '@src/app/map-view/map/layers/result-layer-group';
import { ScenarioLayer } from '@src/app/map-view/map/layers/scenario-layer';
import AreaLayer from '@src/app/map-view/map/layers/area-layer';
import { Extent } from 'ol/extent';
import { DataLayerService } from '@src/app/map-view/map/layers/data-layer.service';
import { isEqual } from "@shared/common.util";
import { dieCutPolygons, turfMergeAll } from "@shared/turf-helper/turf-helper";
import { SelectIntersectionComponent } from "@shared/select-intersection/select-intersection.component";
import { MultiPolygon, Polygon as OLPolygon } from "ol/geom";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry } from "geojson";
import { MergeAreasModalComponent } from "@src/app/map-view/map/merge-areas-modal/merge-areas-modal.component";
import { AreaSelectionConfig } from "@shared/select-intersection/select-intersection.interfaces";
import { AreaHighlightLayer } from "@src/app/map-view/map/layers/area-highlight-layer";
import { ReliabilityLayer } from "@src/app/map-view/map/layers/reliability-layer";
import {
  BandType,
  ReliabilityMap,
} from "@data/metadata/metadata.interfaces";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @Input() mapCenter?: Coordinate;
  @Output() resultLayerGroupChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() resultLayerGroupChangeCmp: EventEmitter<number> = new EventEmitter<number>();
  drawIsActive = false;

  private map?: OLMap;
  private readonly storeSubscription?: Subscription;
  private readonly resultSubscription?: Subscription;
  private readonly resultDeletedSubscription?: Subscription;
  private readonly userSubscription?: Subscription;
  private readonly aliasingSubscription: Subscription;
  private readonly selectedAreasSubscription: Subscription;
  private areaSubscription?: Subscription;
  protected activeScenario$: Observable<Scenario | undefined>;
  private scenarioSubscription: Subscription;
  private scenarioCloseSubscription: Subscription;

  private reliabilitySubject$?: Observable<ReliabilityMap | null>
  private reliabilitySubscription$?: Subscription;

  // layers
  private background?: BackgroundLayer;
  private areaLayer!: AreaLayer;
  private areaHighlightLayer!: AreaHighlightLayer;
  private bandLayer?: BandLayer;
  private resultLayerGroup!: ResultLayerGroup;
  private scenarioLayer!: ScenarioLayer;
  private reliabilityLayers!: {
    ECOSYSTEM: ReliabilityLayer;
    PRESSURE: ReliabilityLayer;
    ECOSYSTEM_OL: ReliabilityLayer;
    PRESSURE_OL: ReliabilityLayer;
  };

  public baselineName = '';
  private geoJson?: GeoJSON;
  private selectedAreas: StatePath[] = [];

  private aliasing = true;

  constructor(
    private store: Store<State>,
    private calcService: CalculationService,
    private scenarioService: ScenarioService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private dataLayerService: DataLayerService,
    private moduleRef: NgModuleRef<never>
  ) {
    this.userSubscription = this.store        /* TOOD: Just get from static environment?*/
      .select(UserSelectors.selectBaseline).pipe(isNotNullOrUndefined())
      .subscribe((baseline) => {
        this.baselineName = baseline.name;
        this.bandLayer = new BandLayer(baseline.name, dataLayerService, this.store, this.aliasing);
        this.map!.getLayers().insertAt(1, this.bandLayer); // on top of background layer
      });

    this.storeSubscription = this.store
      .select(MetadataSelectors.selectVisibleBands)
      .subscribe(components => { // FIXME
        this.bandLayer?.setVisibleBands('ECOSYSTEM', components.ecoComponent);
        this.bandLayer?.setVisibleBands('PRESSURE', components.pressureComponent);
      });

    this.activeScenario$ = this.store.select(ScenarioSelectors.selectActiveScenario);

    this.scenarioSubscription = this.activeScenario$.pipe(
      distinctUntilChanged(
        (prev: Scenario|undefined, curr: Scenario|undefined) => prev?.id === curr?.id &&
          isEqual(prev?.areas.map(a => a.id), curr?.areas.map(a => a.id))),
      isNotNullOrUndefined(),
    ).subscribe((scenario: Scenario) => {
      this.areaLayer.deselectAreas();

      this.scenarioLayer.clearLayers();

      this.scenarioLayer.setScenarioBoundary(scenario);

      this.zoomToExtent(this.scenarioLayer.getBoundaryFeature()!.getGeometry()!.getExtent(),
        500);
    });

    this.scenarioCloseSubscription = this.activeScenario$.pipe(
      skip(1), // undefined as always emitted on start, which does indicate a scenario close
      filter(s => s === undefined)
    ).subscribe(() => {  // A scenario was closed
      // TODO: Remove result layer if loadResultLayerOnOpen is true
      this.scenarioLayer.clearLayers();

      this.setZoom(env.map.initialZoom); // visual cue that scenario has been exited
    });

    // Use store instead?
    this.resultSubscription = this.calcService.resultReady$.subscribe((result: StaticImageOptions) => {
      this.resultLayerGroup.addResult(result);
    });

    this.resultDeletedSubscription = this.calcService.resultRemoved$.subscribe((removedId: number) => {
      this.resultLayerGroup.removeResult(removedId);
    });

    this.aliasingSubscription = this.store.select(UserSelectors.selectAliasing).subscribe((aliasing: boolean) => {
      this.resultLayerGroup?.toggleImageSmoothing(aliasing);
      this.bandLayer?.toggleImageSmoothing(aliasing);
      this.aliasing = aliasing;
    });

    this.selectedAreasSubscription = this.store.select(AreaSelectors.selectSelectedArea).subscribe((selectedArea) => {
      this.selectedAreas = selectedArea;
    });
  }

  async ngAfterViewInit() {
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
        zoom: env.map.initialZoom,
        maxZoom: env.map.maxZoom,
        minZoom: env.map.minZoom,
        // Web Mercator is Open Layers default (like OSM). Use EPSG:4326 instead?
        // projection: proj.get(AppSettings.MAP_PROJECTION),
      }),
      pixelRatio: 1 // to fix tile size to 256x256
    });

    const areaObservable = this.store.select(AreaSelectors.selectAreaFeatures),
      boundaries = await firstValueFrom(this.store.select(AreaSelectors.selectBoundaryFeatures).pipe(
      skipWhile(value => !value || value.features.length === 0)
    ));

    this.resultLayerGroup = new ResultLayerGroup(this);
    this.map.addLayer(this.resultLayerGroup);
    this.geoJson = new GeoJSON({
      featureProjection: this.map.getView().getProjection()
    });

    this.scenarioLayer = new ScenarioLayer(this.scenarioService, this.map.getView().getProjection().getCode(), this.store);

    this.areaLayer = new AreaLayer(
        this.map, this.dispatchSelectionUpdate, this.zoomToExtent,
        this.onDrawEnd, this.onDrawInvalid, this.onDownloadClick, this.onSplitClick, this.onMergeClick,
        this.scenarioLayer, this.translateService, this.geoJson); // Will add itself to the map

    this.areaHighlightLayer = new AreaHighlightLayer(this.geoJson);

    this.areaLayer.setBoundaries(boundaries);

    this.areaSubscription = this.store.select(AreaSelectors.selectAreaFeatures)
      .pipe(skipWhile(value => !value || value.length === 0))
      .subscribe((features) =>
        {
          this.areaLayer.mapAreaFeatures(features);
          this.areaHighlightLayer.mapAreaLayers(features);
        }
      );

    this.store.select(
      AreaSelectors.selectVisibleAreas).subscribe((paths) => {
      this.areaLayer.setVisibleAreas(paths.visible, paths.selected);
    });

    this.reliabilitySubject$ = this.store.select(MetadataSelectors.selectReliabilityMap).pipe(
      skipWhile(reliabilityMap => reliabilityMap === null)
    );

    this.reliabilitySubscription$ = this.reliabilitySubject$.pipe(
      take(1)
      ).subscribe((reliabilityMap ) => {

      this.reliabilityLayers = {
        ECOSYSTEM: new ReliabilityLayer(reliabilityMap!.ECOSYSTEM, true, this.geoJson!),
        PRESSURE: new ReliabilityLayer(reliabilityMap!.PRESSURE, true, this.geoJson!),
        ECOSYSTEM_OL: new ReliabilityLayer(reliabilityMap!.ECOSYSTEM, false, this.geoJson!),
        PRESSURE_OL: new ReliabilityLayer(reliabilityMap!.PRESSURE, false, this.geoJson!)
      };

      this.map!.getLayers().insertAt(1, this.reliabilityLayers.ECOSYSTEM);
      this.map!.getLayers().insertAt(1, this.reliabilityLayers.PRESSURE);
      this.map!.addLayer(this.reliabilityLayers.ECOSYSTEM_OL);
      this.map!.addLayer(this.reliabilityLayers.PRESSURE_OL);

      this.store.select(MetadataSelectors.selectVisibleReliability).subscribe( (visibleReliability) => {
        this.reliabilityLayers.ECOSYSTEM.clear();
        this.reliabilityLayers.PRESSURE.clear();
        this.reliabilityLayers.ECOSYSTEM_OL.clear();
        this.reliabilityLayers.PRESSURE_OL.clear();

        if (visibleReliability !== null) {
          this.showReliability(
            visibleReliability.band.symphonyCategory,
            visibleReliability.band.bandNumber,
            visibleReliability.opaque);
        }
      });
    });

    this.map!.addLayer(this.areaLayer);
    this.map!.addLayer(this.scenarioLayer);
    this.map!.addLayer(this.areaHighlightLayer);
  }

  public clearResult() {
    this.resultLayerGroup.clearResult();
    this.store.dispatch(CalculationActions.resetComparisonLegend())
  }

  public highlightArea = (statePath: StatePath, highlight: boolean) => {
    if (highlight) {
      this.areaHighlightLayer.highlightArea(statePath);
    } else {
      this.areaHighlightLayer.clearHighlight(statePath);
    }
  }

  public showReliability = (bandType: BandType, bandNumber: number, opaqueLayer: boolean) => {
    const layerKey = bandType + (opaqueLayer ? '' : '_OL') as keyof typeof this.reliabilityLayers;
    this.reliabilityLayers[layerKey].highlightReliability(bandNumber);
  }

  public emitLayerChange(resultIds: number[], cmpCount: number):void {
    this.resultLayerGroupChange.emit(resultIds.length);
    this.resultLayerGroupChangeCmp.emit(cmpCount);
    this.store.dispatch(CalculationActions.setVisibleResultLayers({ visibleResults: resultIds }));
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'x' && event.altKey) {
      this.clearResult();
    }
  }

  private dispatchSelectionUpdate = (statePath: StatePath | undefined, expand: boolean) => {
    this.store.dispatch(AreaActions.updateSelectedArea({ statePath, expand }));
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
    if (this.resultDeletedSubscription) {
      this.resultDeletedSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.aliasingSubscription) {
      this.aliasingSubscription.unsubscribe();
    }

    this.selectedAreasSubscription.unsubscribe();
    this.scenarioCloseSubscription.unsubscribe();
    this.scenarioSubscription.unsubscribe();
  }

  toggleDrawInteraction = () => {
    this.drawIsActive = this.areaLayer.toggleDrawInteraction();
  };

  onDrawInvalid = async () => {
    this.store.dispatch(MessageActions.addPopupMessage({
      message: {
        type: 'WARNING',
        title: this.translateService.instant('map.user-area.create.invalid-area.title'),
        message: this.translateService.instant('map.user-area.create.invalid-area.message'),
        uuid: uuid()
      }
    }));
  }

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
  };

  // Alt key + select area interaction
  onSplitClick = async (feature: Feature, prevFeature: Feature) => {
    const diff = dieCutPolygons(feature, prevFeature), prevName = prevFeature.get('name');
    if (diff.length > 0) {
      const areaConf = diff.map( (p, ix) =>
        this.reprojectAsFragment(p, ['«', areaSliceName(prevName, ix),'»'].join(' ')) ),

        polygonsToSave = await this.dialogService.open(SelectIntersectionComponent, this.moduleRef, {
          data: {
            areas: areaConf,
            multi: true,
            projection: 'EPSG:4326',
            reprojection: 'EPSG:3857',
            headerTextKey: 'map.split-area.modal.header',
            messageTextKey: diff.length > 1 ? 'map.split-area.modal.message' : 'map.split-area.modal.message-single',
            confirmTextKey: diff.length > 1 ? 'map.split-area.modal.confirm' : 'map.split-area.modal.confirm-single',
            metaDescriptionTextKey: 'map.split-area.modal.meta-description'
          }
        }) as boolean[];

      polygonsToSave.forEach((p, ix) => {
        if(p) {
          this.store.dispatch(AreaActions.createUserDefinedArea({
            name: areaSliceName(prevFeature.get('name'), ix),
            polygon: MapComponent.convertToSave(areaConf[ix].polygon),
            description: ''
          }));
        }
      });
    }
  }

  // (Alt + Shift) keys + select area interaction
  onMergeClick = async (lastFeature: Feature) => {

    // Some readability have been sacrificed for the convenience of
    // utilizing existing component logic (and versatility of integers).
    // The MergeAreasModal component will return either:
    // the numeric index of the input areas + 1,
    // 0 if the user opts to save the merged area as a new area,
    // -1 if the user cancels the operation
    //
    // To access the input arrays we, however arbitrarily, subtract 1
    // from the return value and treat -1 as the special case to indicate
    // new area creation.
    const selectedFeatures =
      [...(this.areaLayer.getFeaturesByStatePaths(this.selectedAreas) || []), lastFeature],
      names = selectedFeatures.map(f => f.get('name')),
      paths = selectedFeatures.map(f => f.get('statePath')),
      merged = turfMergeAll(selectedFeatures);

    if(merged !== null) {
      const areaIndexToSave = await this.dialogService.open(MergeAreasModalComponent, this.moduleRef, {
        data : {
          areas: [this.reprojectAsFragment(merged, '')],
          paths,
          names
        }
      }) as number - 1;

      if (areaIndexToSave >= -1) {

        const areaToSave = {
          id: areaIndexToSave === -1 ? 0 : paths[areaIndexToSave][1],
          name: areaIndexToSave === -1 ?
            names[0] + ' extension' : names[areaIndexToSave],
          polygon: MapComponent.convertToSave(merged!),
          description: ['"', names[0], '" extended by "', names[1], '"' ].join('')
        }

        if (areaIndexToSave === -1) {
          this.store.dispatch(AreaActions.createUserDefinedArea(areaToSave));
        } else {
          this.store.dispatch(AreaActions.updateUserDefinedArea(areaToSave));
        }
      }
    }
  }

  onDownloadClick = async (path: string) => {
    document.location.href = env.apiBaseUrl + '/areas/download?path=' + path;
  }

  // The virtual transform methods on OpenLayers Geometry subclasses
  // apparently does not support the EPSG:6326 projection used by turfjs
  convert6326(polygon: Polygon): Geometry {
    return this.geoJson!.writeGeometryObject(
      this.geoJson!.readGeometry(polygon, { featureProjection: 'EPSG:4326', dataProjection: 'EPSG:6326'}),
      { featureProjection: 'EPSG:4326'})
  }

  reprojectAsFragment(p: Polygon, description: string) : AreaSelectionConfig {
    return {
      polygon: this.convert6326(p),
      metaDescription: description
    };
  }

  static convertToSave(polygon : unknown): Polygon {
     const transformed = (polygon as Polygon).type === 'MultiPolygon' ?
        new MultiPolygon((polygon as GeoJSON.MultiPolygon).coordinates) :
        new OLPolygon((polygon as GeoJSON.Polygon).coordinates);
    transformed.transform('EPSG:3857', 'EPSG:4326');

    return {  type:        transformed.getType().toString(),
              coordinates: transformed.getCoordinates() };
  }

  public center() {
    this.map!.getView().animate({ center: env.map.center, duration: 250 });
  }

  public zoomIn() {
    this.setZoom(this.map!.getView()!.getZoom()! + 1);
  }

  public zoomOut() {
    this.setZoom(this.map!.getView()!.getZoom()! - 1);
  }

  private setZoom = (zoomLevel: number, duration = 250, center?: Coordinate) => {
    this.map!.getView().animate({ zoom: zoomLevel, duration }, { center });
  };

  public zoomToArea = (statePaths: StatePath[]) => {
    this.areaLayer.zoomToArea(statePaths);
  };

  public zoomToExtent(extent: Extent, duration: number) {
    const padding = env.map.zoomPadding;
    this.map!.getView().fit(extent, {
      padding: [padding, padding, padding, /*40 rem=*/400], // TODO: set last element to width of left side panel, if
      // open
      // TODO observe state of sidebar toggle
      duration
    });
  }

  public setMapOpacity(opacity: number) {
    // The event object is sometimes emitted when using this function
    // in an input event, which makes the opacity reset to 1
    if (this.background)
      this.background.setOpacity(opacity);
  }
}

function areaSliceName(areaName: string, index: number): string {
  return areaName + ' slice - ' + (index + 1);
}
