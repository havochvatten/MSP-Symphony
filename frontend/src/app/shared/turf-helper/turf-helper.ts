import Feature from "ol/Feature";
import { Polygon } from "@data/area/area.interfaces";
import { Feature as TFeature, Polygon as TPolygon } from "@turf/helpers/dist/js/lib/geojson";
import { SimpleGeometry } from "ol/geom";
import { polygon, multiPolygon, MultiPolygon } from "@turf/helpers";
import intersect from "@turf/intersect";
import intersects from '@turf/boolean-intersects';
import booleanEqual from "@turf/boolean-equal";
import difference from "@turf/difference";
import union from "@turf/union";
import cleanCoords from "@turf/clean-coords";

function extractTurfPolygon(feature: Feature): TFeature<TPolygon|MultiPolygon> {
  const geometry = feature.getGeometry() as SimpleGeometry,
        coordinates = geometry.getCoordinates()!;
  return geometry.getType() === 'Polygon' ? polygon(coordinates) : multiPolygon(coordinates)
}

function turfAsSymphonyPoly(turfPolygon: TFeature<TPolygon|MultiPolygon>): Polygon {
    return {
      type: turfPolygon.geometry.type,
      coordinates: turfPolygon.geometry.coordinates
    }
}

function turfSubtract(_polygon: Feature, intersector: Feature): Polygon | null {
  const tFeature = extractTurfPolygon(_polygon),
        turfDiff = difference(tFeature, extractTurfPolygon(intersector));
  return turfDiff && !booleanEqual(tFeature, turfDiff) ? turfAsSymphonyPoly(turfDiff) : null;
}

export function turfMerge(_polygon: Feature, extension: Feature): Polygon | null {
  const merged = union(extractTurfPolygon(_polygon), extractTurfPolygon(extension));

  return merged ? turfAsSymphonyPoly(cleanCoords(merged)) : null;
}

export function turfMergeAll(polygons: Feature[]): Polygon | null {
    const tPolys = polygons.map(p => extractTurfPolygon(p)),
        merged = tPolys.reduce((acc, tPoly) => union(acc, tPoly)!, tPolys[0]);

  return merged ? turfAsSymphonyPoly(cleanCoords(merged)) : null;
}

export function turfIntersects(_polygon: Feature, intersector: Feature): boolean {
  return intersects(extractTurfPolygon(_polygon), extractTurfPolygon(intersector));
}

function turfIntersect(_polygon: Feature, intersector: Feature): Polygon | null {
  const tPoly1 = extractTurfPolygon(_polygon),
        tPoly2 = extractTurfPolygon(intersector),
        turfIntersection = intersect(tPoly1, tPoly2);
  return turfIntersection && !(booleanEqual(turfIntersection, tPoly2) || booleanEqual(turfIntersection, tPoly1)) ?
    turfAsSymphonyPoly(turfIntersection) : null;
}

/**
 * Determines both relative complements and the intersection of two polygons
 * and returns an array:<br>
 * `[polygon1 - polygon 2, polygon2 - polygon1, intersection]`<br>
 * or null if the input polygons are disjoint or identical.<br>
 * If either complement is empty (contained within the other poly), it is omitted.
 * @param polygon1
 * @param polygon2
 */
export function dieCutPolygons(polygon1: Feature, polygon2: Feature): Polygon[] {
  return [turfSubtract(polygon1, polygon2),
    turfSubtract(polygon2, polygon1),
    turfIntersect(polygon1, polygon2)].filter(p => p !== null) as Polygon[];
}
