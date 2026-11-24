import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

import BandLayer from './band-layer';
import { DataLayerService } from './data-layer.service';
import { MetadataActions } from '@data/metadata';
import { Band } from '@data/metadata/metadata.interfaces';
import { State } from '@src/app/app-reducer';

describe('BandLayer', () => {
  let store: jasmine.SpyObj<Store<State>>;
  let bandLayer: BandLayer;

  const grasal = (loaded?: boolean): Band => ({
    title: 'Gråsäl',
    bandNumber: 1,
    symphonyCategory: 'ECOSYSTEM',
    selected: false,
    reliability: null,
    meta: {},
    visible: true,
    loaded
  });

  beforeEach(() => {
    store = jasmine.createSpyObj<Store<State>>('Store', ['dispatch']);
    const dataLayerService = {
      getDataLayer: () =>
        of(
          new HttpResponse({
            body: new Blob(),
            headers: new HttpHeaders({ 'SYM-Image-Extent': '[0, 0, 1, 1]' })
          })
        )
    } as unknown as DataLayerService;
    bandLayer = new BandLayer('baseline', dataLayerService, store, false);
  });

  it('reports a layer turned back on from its cache as loaded, after a reset cleared the flag', () => {
    bandLayer.setVisibleBands('ECOSYSTEM', [grasal()]);
    bandLayer.setVisibleBands('ECOSYSTEM', []);
    store.dispatch.calls.reset();

    bandLayer.setVisibleBands('ECOSYSTEM', [grasal()]);

    expect(store.dispatch).toHaveBeenCalledOnceWith(
      MetadataActions.setLoadedState({ band: grasal(), value: true })
    );
  });

  it('does not report a cached layer again once it is marked loaded', () => {
    bandLayer.setVisibleBands('ECOSYSTEM', [grasal()]);
    bandLayer.setVisibleBands('ECOSYSTEM', []);
    store.dispatch.calls.reset();

    bandLayer.setVisibleBands('ECOSYSTEM', [grasal(true)]);
    bandLayer.setVisibleBands('ECOSYSTEM', [grasal(true)]);

    expect(store.dispatch).not.toHaveBeenCalled();
  });
});
