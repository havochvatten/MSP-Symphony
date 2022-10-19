package se.havochvatten.symphony.calculation;

import org.geotools.data.geojson.GeoJSONReader;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.JTSFactoryFinder;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LinearRing;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.referencing.crs.CoordinateReferenceSystem;

import java.io.IOException;
import java.io.InputStream;

import static org.junit.Assert.fail;

public class TestUtil {
    /**
     * @return JTS Geometry
     */
    public static Geometry makeROI(Coordinate[] coords) {
        GeometryFactory geometryFactory = JTSFactoryFinder.getGeometryFactory();

        // Use WKTReader reader = new WKTReader( geometryFactory )? (https://docs.geotools
        // .org/stable/userguide/library/jts/geometry.html)
        LinearRing ring = geometryFactory.createLinearRing(coords);
        return geometryFactory.createPolygon(ring, null);
    }

    /**
     * @param crs CRS of coords
     * @return Geometry in WGS84 format
     */
    public static Geometry makeROI(Coordinate[] coords, CoordinateReferenceSystem crs) {
        try {
            var transform = CRS.findMathTransform(crs, DefaultGeographicCRS.WGS84);
            var polygon = makeROI(coords);
            return JTS.transform(polygon, transform);
        } catch (Exception e) {
            fail();
            return null;
        }
    }

    public static SimpleFeature getFeatureFromJSON(InputStream is) throws IOException {
        var featureCollection = new GeoJSONReader(is).getFeatures();
        var simpleFeatures = featureCollection.features();
        assert(simpleFeatures.hasNext());
        return featureCollection.features().next();
    }
}
