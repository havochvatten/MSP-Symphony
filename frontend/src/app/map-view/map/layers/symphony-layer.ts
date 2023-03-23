import RenderEvent from "ol/render/Event";
import LayerGroup from "ol/layer/Group";

export abstract class SymphonyLayerGroup extends LayerGroup {

  public antialias = true;
  protected renderHandler = (evt: RenderEvent) => (evt.context! as CanvasRenderingContext2D).imageSmoothingEnabled = this.antialias;

  public toggleImageSmoothing() {
    this.antialias = !this.antialias;
    this.changed();
  }
}
