package se.havochvatten.symphony.scenario;

import it.geosolutions.jaiext.JAIExt;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.data.geojson.GeoJSONReader;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.gce.geotiff.GeoTiffReader;
import org.geotools.geometry.DirectPosition2D;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.geotools.util.factory.GeoTools;
import org.geotools.util.factory.Hints;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.opengis.filter.FilterFactory2;
import org.opengis.geometry.DirectPosition;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.MathTransform;
import se.havochvatten.symphony.calculation.Operations;
import se.havochvatten.symphony.calculation.SymphonyCoverageProcessor;
import se.havochvatten.symphony.dto.LayerType;

import java.io.File;
import java.io.IOException;

import static org.junit.Assert.assertEquals;

// N.B: Make sure the JVM default encoding is UTF-8, or else GeoJSOSReader will crash.
// In practice: Use -Dfile.encoding="UTF8" on Windows
public class ScenarioServiceTest {
    private ScenarioService service;

    public static final double TOL = 1.0;

    private static GridCoverage2D coverage;

    private static MathTransform transform;
    private static SimpleFeatureCollection changes;

    private final FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2(GeoTools.getDefaultHints());

    // some point inside the roi
    DirectPosition INSIDE_ROI = new DirectPosition2D(4779423.99261460639536381, 4478816.44365324918180704);
    // some point outside the roi
    DirectPosition OUTSIDE_ROI = new DirectPosition2D(4785778, 4473150);

    @BeforeClass
    public static void setupClass() throws IOException, FactoryException {
        JAIExt.initJAIEXT();

        Hints hints = null; //new Hints(Hints.FORCE_LONGITUDE_FIRST_AXIS_ORDER, Boolean.TRUE);
        coverage = new GeoTiffReader(new File(ScenarioServiceTest.class.getClassLoader().
                getResource("SGU-2019-multiband/ecocomponents-tiled-packbits.tif").getFile()), hints).read(null);

        var crs = CRS.getAuthorityFactory(true).createCoordinateReferenceSystem("EPSG:3035"); // TODO get from
        transform = CRS.findMathTransform(DefaultGeographicCRS.WGS84, /*coverage
        .getCoordinateReferenceSystem()*/crs);

        var reader = new GeoJSONReader(ScenarioServiceTest.class.getClassLoader().getResourceAsStream(
                "polygons/test-changes.geojson"));
        changes = reader.getFeatures();
    }

    @Before
    public void setup() {
        service = new ScenarioService(new Operations(new SymphonyCoverageProcessor()));
    }

    private GridCoverage2D applyChanges(SimpleFeatureCollection changes) {
        return service.apply(coverage, coverage.getGridGeometry(), changes, LayerType.PRESSURE, transform);
    }

    @Test
    public void applyChange() {
        final int BAND = 12;
        // TODO fix the library to be able to use more creative feature ids
        var simpleChange = changes.subCollection(ff.id(ff.featureId("features.0")));

        var insideValues = (byte[]) coverage.evaluate(INSIDE_ROI);
        var outsideValues = (byte[]) coverage.evaluate(OUTSIDE_ROI);

        var result = applyChanges(simpleChange);

        var newOutsideValues = (byte[]) result.evaluate(OUTSIDE_ROI);
        assertEquals(outsideValues[BAND], newOutsideValues[BAND], TOL);

        var newInsideValues = (byte[]) result.evaluate(INSIDE_ROI);
        assertEquals(insideValues[17], newInsideValues[17], 0.1); // other bands should remain unchanged
        assertEquals(1.1 * insideValues[BAND], newInsideValues[BAND], TOL);
    }

    @Test
    public void applyCompoundChange() {
        int BAND = 12;

        var compoundChange = changes.subCollection(ff.id(ff.featureId("features.1")));

        byte[] insideValues = (byte[]) coverage.evaluate(INSIDE_ROI);
        byte[] outsideValues = (byte[]) coverage.evaluate(OUTSIDE_ROI);

        var result = applyChanges(compoundChange);

        byte[] newOutsideValues = (byte[]) result.evaluate(OUTSIDE_ROI);
        assertEquals(outsideValues[BAND], newOutsideValues[BAND], TOL);

        byte[] newInsideValues = (byte[]) result.evaluate(INSIDE_ROI);
        assertEquals(1.1 * insideValues[BAND] + 1, newInsideValues[BAND], TOL);
    }

    @Test
    public void applyBigChange() { // Test clamping of big values
        int BAND = 12;

        var bigChange = changes.subCollection(ff.id(ff.featureId("features.2")));

        var result = applyChanges(bigChange);

        byte[] newInsideValues = (byte[]) result.evaluate(INSIDE_ROI);
        assertEquals(100, newInsideValues[BAND]);
    }

    @Test
    public void applyZeroChange() {
        int BAND = 12;

        var zeroChange = changes.subCollection(ff.id(ff.featureId("features.3")));

        var result = applyChanges(zeroChange);

        byte[] newInsideValues = (byte[]) result.evaluate(INSIDE_ROI);
        assertEquals(0, newInsideValues[BAND], TOL);
    }
}
