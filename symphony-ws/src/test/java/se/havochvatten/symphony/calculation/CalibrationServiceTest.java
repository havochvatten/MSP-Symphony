package se.havochvatten.symphony.calculation;

import it.geosolutions.jaiext.JAIExt;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.gce.geotiff.GeoTiffReader;
import org.geotools.util.factory.Hints;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.io.File;
import java.io.IOException;
import java.util.stream.IntStream;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;

public class CalibrationServiceTest {

    static CalibrationService service;

    static GridCoverage2D ecoComponents;

    static {
        JAIExt.initJAIEXT();
    }

    @BeforeClass
    public static void setup() throws IOException {
        Hints hints = null;
        ecoComponents = new GeoTiffReader(new File(CalibrationServiceTest.class.getClassLoader().
            getResource("SGU-2019-multiband/ecocomponents-tiled-packbits.tif").getFile()), hints).read(null);
        service = new CalibrationService(new Operations(new SymphonyCoverageProcessor()));
    }

    @Test
    public void calcGlobalIndices() {
        var bands = new int[]{1, 2, 3}; // N.B: Skip first one
        var result = service.calculateGlobalCommonnessIndices(ecoComponents, bands, 42);
        assertArrayEquals(new double[] {6282201.0, 1.09530434E8, 349100.0}, result, 10.0);
    }

    @Test
    public void calcLocalIndices() {
        Coordinate[] coords =
            new Coordinate[]{ // Rectangle in the south-east archipelago of Gothenburg
                new Coordinate(4428000, 3826000),
                new Coordinate(4430000, 3826000),
                new Coordinate(4430000, 3830000),
                new Coordinate(4428000, 3830000),
                new Coordinate(4428000, 3826000),
            };

        var geom = TestUtil.makeROI(coords);
        var bands = new int[]{1, 2, 3};

        var result = service.calculateLocalCommonnessIndices(ecoComponents, bands, geom);
        assertArrayEquals(new double[] {849.0, 12288.0, 100.0}, result, 1.0);
    }
}
