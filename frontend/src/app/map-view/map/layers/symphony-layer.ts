import LayerGroup from "ol/layer/Group";

export abstract class SymphonyLayerGroup extends LayerGroup {
  public antialias = true;

  public toggleImageSmoothing(aliasing: boolean) {
    this.antialias = aliasing;
  }
}
