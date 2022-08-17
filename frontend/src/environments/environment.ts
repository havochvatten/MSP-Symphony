// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  showBaseCalculations: false,
  showIncludeCoastCheckbox: true,
  apiBaseUrl: "/symphony-ws/service",
  baseline: 'BASELINE2019',
  areas: {
    countryCode: "SWE",
  },
  map: {
    center: [11.40, 57.61], // Kattegatt
    maxZoom: 10,
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
    },
    hav: {
      wmsUrl: 'https://geodata.havochvatten.se/geoservices/hav-bakgrundskartor/wms',
      params: { LAYERS: 'hav-bakgrundskartor:hav-grundkarta' },
      serverType: 'geoserver'
    }
  },
  login: {
    noAccountUrl: "https://sspr.havochvatten.se/sspr/public/newuser/profile/HaVkonto",
    forgotPasswordUrl: "https://sspr.havochvatten.se/sspr/public/forgottenpassword"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
