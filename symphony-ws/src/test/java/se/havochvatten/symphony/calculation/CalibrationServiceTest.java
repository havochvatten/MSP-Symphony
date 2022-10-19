package se.havochvatten.symphony.calculation;

import it.geosolutions.jaiext.JAIExt;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.data.geojson.GeoJSONReader;
import org.geotools.gce.geotiff.GeoTiffReader;
import org.geotools.geometry.jts.JTS;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.geotools.util.factory.Hints;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.io.ParseException;
import org.locationtech.jts.io.geojson.GeoJsonReader;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.MathTransform;
import org.opengis.referencing.operation.TransformException;
import se.havochvatten.symphony.scenario.ScenarioServiceTest;

import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.stream.IntStream;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;

public class CalibrationServiceTest {
    static CalibrationService service;
    static GridCoverage2D ecoComponents;
    static MathTransform WGS84toTarget;

    static {
        System.setProperty("org.geotools.referencing.forceXY", "true");
        JAIExt.initJAIEXT();
    }

    @BeforeClass
    public static void setup() throws IOException, FactoryException {
        Hints hints = null;
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

        var result = service.calculateLocalCommonnessIndices(ecoComponents, bands, feature);
        assertArrayEquals(new double[] {9381.0, 653993.0, 7400.0}, result, 1.0);
    }
}
