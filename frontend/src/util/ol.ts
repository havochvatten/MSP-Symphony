import VectorSource from 'ol/source/Vector';
import { StatePath } from '@data/area/area.interfaces';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';

/** @returns The feature whose statePath property equals `path`, or null if not found */
export function getFeatureByStatePath(
  source: VectorSource,
  path: StatePath,
  comparator?: (a: StatePath, b: StatePath) => boolean
): Feature<Geometry> | null {
  return (
    source.forEachFeature(f => {
      const equals = comparator
        ? comparator(f.get('statePath'), path)
        : f.get('statePath') === path;

      return equals ? f : null;
    }) ?? null
  );
}
