package se.havochvatten.symphony.scenario;

import it.geosolutions.jaiext.JAIExt;
import org.geotools.coverage.grid.GridCoverage2D;
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
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.dto.ScenarioAreaDto;
import se.havochvatten.symphony.dto.ScenarioDto;

import java.io.File;
import java.io.IOException;

import static org.junit.Assert.assertEquals;
import static se.havochvatten.symphony.scenario.ScenarioRESTTest.getTestArea;
import static se.havochvatten.symphony.web.RESTTest.getDomainNormalization;
import static se.havochvatten.symphony.web.RESTTest.makeBaseline;

// N.B: Make sure the JVM default encoding is UTF-8, or else GeoJSOSReader will crash.
// In practice: Use -Dfile.encoding="UTF8" on Windows
public class ScenarioServiceTest {
    private ScenarioService service;

    public static final double TOL = 1.0;

    private static GridCoverage2D coverage;

    private static MathTransform transform;

    private static ScenarioDto testScenario;

    private static ScenarioAreaDto[] testAreas;

    private final FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2(GeoTools.getDefaultHints());

    // some point inside the roi
    DirectPosition INSIDE_ROI = new DirectPosition2D(4779423.99261460639536381, 4478816.44365324918180704);
    // some point outside the roi
    DirectPosition OUTSIDE_ROI = new DirectPosition2D(4785778, 4473150);

    @BeforeClass
    public static void setupClass() throws IOException, FactoryException {
        JAIExt.initJAIEXT();

        testAreas = new ScenarioAreaDto[3];
        testAreas[0] = getTestArea("service0");
        testAreas[1] = getTestArea("service1");
        testAreas[2] = getTestArea("service2");

        testScenario = ScenarioDto.createWithoutId("TEST-SCENARIO",
            makeBaseline(),
            null,
            getDomainNormalization());

        testScenario.ecosystemsToInclude = new int[] { 17 };
        testScenario.pressuresToInclude  = new int[] { 12 };

        Hints hints = null; //new Hints(Hints.FORCE_LONGITUDE_FIRST_AXIS_ORDER, Boolean.TRUE);
        coverage = new GeoTiffReader(new File(ScenarioServiceTest.class.getClassLoader().
                getResource("SGU-2019-multiband/ecocomponents-tiled-packbits.tif").getFile()), hints).read(null);

        var crs = CRS.getAuthorityFactory(true).createCoordinateReferenceSystem("EPSG:3035"); // TODO get from
        transform = CRS.findMathTransform(DefaultGeographicCRS.WGS84, /*coverage
        .getCoordinateReferenceSystem()*/crs);
    }

    @Before
    public void setup() {
        service = new ScenarioService(new Operations());
    }

    private GridCoverage2D applyChanges(Scenario scenario) {


        return service.apply(coverage, coverage.getGridGeometry(), scenario.getAreas(), LayerType.PRESSURE, transform, null);
    }

    @Test
    public void applyChange() {

        final int BAND = 12;
        testScenario.areas = new ScenarioAreaDto[] { testAreas[0] };
        Scenario scenario = new Scenario(testScenario, service);

        var insideValues = (byte[]) coverage.evaluate(INSIDE_ROI);
        var outsideValues = (byte[]) coverage.evaluate(OUTSIDE_ROI);

        var result = applyChanges(scenario);

        var newOutsideValues = (byte[]) result.evaluate(OUTSIDE_ROI);
        assertEquals(outsideValues[BAND], newOutsideValues[BAND], TOL);

        var newInsideValues = (byte[]) result.evaluate(INSIDE_ROI);
        assertEquals(insideValues[17], newInsideValues[17], 0.1); // other bands should remain unchanged
        assertEquals(1.1 * insideValues[BAND], newInsideValues[BAND], TOL);

    }

//    "compound change" is not supported
//    @Test
//    public void applyCompoundChange() {
//        int BAND = 12;
//
//        var compoundChange = changes.subCollection(ff.id(ff.featureId("features.1")));
//
//        byte[] insideValues = (byte[]) coverage.evaluate(INSIDE_ROI);
//        byte[] outsideValues = (byte[]) coverage.evaluate(OUTSIDE_ROI);
//
//        var result = applyChanges(compoundChange);
//
//        byte[] newOutsideValues = (byte[]) result.evaluate(OUTSIDE_ROI);
//        assertEquals(outsideValues[BAND], newOutsideValues[BAND], TOL);
//
//        byte[] newInsideValues = (byte[]) result.evaluate(INSIDE_ROI);
//        assertEquals(1.1 * insideValues[BAND] + 1, newInsideValues[BAND], TOL);
//    }

    @Test
    public void applyBigChange() { // Test clamping of big values
        int BAND = 12;

        testScenario.areas = new ScenarioAreaDto[] { testAreas[1] };
        Scenario scenario = new Scenario(testScenario, service);

        var result = applyChanges(scenario);

        byte[] newInsideValues = (byte[]) result.evaluate(INSIDE_ROI);
        assertEquals(100, newInsideValues[BAND]);
    }

    @Test
    public void applyZeroChange() {

        int BAND = 12;

        testScenario.areas = new ScenarioAreaDto[] { testAreas[2] };
        Scenario scenario = new Scenario(testScenario, service);

        var result = applyChanges(scenario);

        byte[] newInsideValues = (byte[]) result.evaluate(INSIDE_ROI);
        assertEquals(0, newInsideValues[BAND], TOL);
    }
}
