// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  showBaseCalculations: false,
  showIncludeCoastCheckbox: true,
  apiBaseUrl: "/symphony-ws/service",
  socketBaseUrl: "/socket",
  baseline: false,
  instanceName: "WIO Symphony",
  instanceImage: "assets/wio/wiosym-ideogram.svg",
  instanceDescriptor: "Western Indian Ocean",
  map: {
    center: [39.0, -11.0], // Suitable starting center for WIO region
    initialZoom: 4.5,
    maxZoom: 18,
    minZoom: 3,
    zoomPadding: 20,
    disableBackgroundMap: false,
    colorCodeIntensityChanges: false
  },
  editor: {
    autoSaveIntervalInSeconds: 60, // 0 to disable
    loadLatestCalculation: false
  },
  backgroundMap: {
    gebco: {
      url: 'https://www.gebco.net/data_and_products/gebco_web_services/web_map_service/mapserv',
      params: {
        LAYERS: 'GEBCO_latest',
        TILED: 'true'
      }
    },
    openSeaMap: {
      url: 'https://t1.openseamap.org/seamark/{z}/{x}/{y}.png'
      // marineProfile: {
      //   url: 'http://osm.franken.de:8080/geoserver/gwc/service/wms',
      //   params: {
      //     LAYERS: 'gebco_2014',
      //     TILED: 'true',
      //     SRS: 'EPSG:3857'
      //   },
      //   serverType: 'geoserver'
      // }
    }
  },
  login: {
    noAccountUrl: 'mailto:wiosym@nairobiconvention.org?subject=Requesting%20user%20account%20for%20WIO%20Symphony',
    forgotPasswordUrl: 'mailto:wiosym@nairobiconvention.org?subject=Requesting%20password%20reset%20for%20WIO%20Symphony'
  },
  meta: {
    visible_fields: ['methodSummary',
                    'limitationsForSymphony',
                    'valueRange',
                    'dataProcessing',
                    'dataSources'],
    list_fields:    ['dataSources']
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
