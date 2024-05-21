import VectorSource from 'ol/source/Vector';
import { StatePath } from '@data/area/area.interfaces';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';

/** @returns The features whose statePath property is contained in `paths`, or null if not found */
export function getFeaturesByStatePaths(
  source: VectorSource<Feature>,
  paths: StatePath[]
): Feature<Geometry>[] | null {
  const matchingFeatures: Feature<Geometry>[] = [];

  source.forEachFeature(f => {
    if(paths.includes(f.get('statePath') as StatePath)){
      matchingFeatures.push(f);
    }
  });

  return matchingFeatures.length > 0 ? matchingFeatures : null;
}
