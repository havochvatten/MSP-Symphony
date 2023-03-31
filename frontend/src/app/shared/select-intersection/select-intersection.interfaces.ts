import { GeoJSONGeometry } from "ol/format/GeoJSON";

export interface AreaSelectionConfig {
  polygon: GeoJSONGeometry,
  metaDescription: string
}
