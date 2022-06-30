export const environment = {
  production: true,
  showBaseCalculations: true,
  showIncludeCoastCheckbox: true,
  apiBaseUrl: "/symphony-ws/service",
  baseline: 'BASELINE2019_CM', // set to some false value to use default
  map: {
    center: [14.94, 60.57], // Modified center of Sweden with focus on seas
    maxZoom: 10,
    zoomPadding: 20,
    disableBackgroundMap: false,
    colorCodeIntensityChanges: false
  },
  editor: {
    autoSaveIntervalInSeconds: 30, // 0 to disable
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
