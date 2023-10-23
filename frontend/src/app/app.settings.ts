export class AppSettings {
  public static MAP_PROJECTION = 'EPSG:4326';
  public static DATALAYER_RASTER_CRS = 'EPSG:4326'; // 'ESRI:54034';

  /** True causes rasters to be reprojected on the frontend */
  public static CLIENT_SIDE_PROJECTION = false;
}
