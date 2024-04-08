package se.havochvatten.symphony.calculation;

import it.geosolutions.jaiext.JAIExt;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.gce.geotiff.GeoTiffReader;
import org.geotools.geometry.jts.JTS;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.geotools.util.factory.Hints;
import org.junit.BeforeClass;
import org.junit.Test;
import org.locationtech.jts.geom.Geometry;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.MathTransform;
import org.opengis.referencing.operation.TransformException;
import se.havochvatten.symphony.service.CalibrationService;

import java.io.File;
import java.io.IOException;
import java.util.List;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;

public class CalibrationServiceTest {
    static CalibrationService service;
    static GridCoverage2D ecoComponents;
    static MathTransform WGS84toTarget;

    static {
        JAIExt.initJAIEXT();
    }

    @BeforeClass
    public static void setup() throws IOException, FactoryException {
        Hints hints = new Hints(Hints.FORCE_LONGITUDE_FIRST_AXIS_ORDER, Boolean.TRUE);
        ecoComponents = new GeoTiffReader(new File(CalibrationServiceTest.class.getClassLoader().
            getResource("SGU-2019-multiband/ecocomponents-tiled-packbits.tif").getFile()), hints).read(null);
        service = new CalibrationService(new Operations());
        WGS84toTarget = CRS.findMathTransform(DefaultGeographicCRS.WGS84,
            ecoComponents.getCoordinateReferenceSystem());
    }

    @Test
    public void calcGlobalIndices() {
        var bands = new int[]{1, 2, 3}; // N.B: Skip first one
        var result = service.calculateGlobalCommonnessIndices(ecoComponents, bands, 42);
        assertArrayEquals(new double[] {6282201.0, 1.09530434E8, 349100.0}, result, 10.0);
    }

    @Test
    public void calcLocalIndices() throws IOException, TransformException {
        var bands = new int[]{1, 2, 3};

        var feature = TestUtil.getFeatureFromJSON(
            CalibrationServiceTest.class.getClassLoader().getResourceAsStream("polygons/lysekil.geojson"));

        feature.setDefaultGeometry(JTS.transform((Geometry) feature.getDefaultGeometry(), WGS84toTarget));

        var result = service.calculateLocalCommonnessIndices(ecoComponents, bands, List.of(feature));
        assertArrayEquals(new double[] {9381.0, 653993.0, 7400.0}, result, 1.0);
    }
}
