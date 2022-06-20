package se.havochvatten.symphony.calculation;

import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.JTSFactoryFinder;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LinearRing;
import org.opengis.referencing.crs.CoordinateReferenceSystem;

import static org.junit.Assert.fail;

public class TestUtil {
    /**
     * @return Geometry in WGS84 format
     */
    public static Geometry makeROI(Coordinate[] coords, CoordinateReferenceSystem crs) {
        try {
            GeometryFactory geometryFactory = JTSFactoryFinder.getGeometryFactory();

            // Use WKTReader reader = new WKTReader( geometryFactory )? (https://docs.geotools
            // .org/stable/userguide/library/jts/geometry.html)
            LinearRing ring = geometryFactory.createLinearRing(coords);
            var polygon = geometryFactory.createPolygon(ring, null);
            var transform = CRS.findMathTransform(crs, DefaultGeographicCRS.WGS84);

            return JTS.transform(polygon, transform);
        } catch (Exception e) {
            fail();
            return null;
        }
    }
}
