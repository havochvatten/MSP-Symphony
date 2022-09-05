package se.havochvatten.symphony.calculation;

import it.geosolutions.jaiext.JAIExt;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.gce.geotiff.GeoTiffReader;
import org.geotools.util.factory.Hints;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.io.File;
import java.io.IOException;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;

public class CalibrationServiceTest {

    CalibrationService service;

    GridCoverage2D ecoComponents;

    static {
        JAIExt.initJAIEXT();
    }

    @Before
    public void setup() throws IOException {
        Hints hints = null;
        ecoComponents = new GeoTiffReader(new File(CalibrationServiceTest.class.getClassLoader().
            getResource("SGU-2019-multiband/ecocomponents-tiled-packbits.tif").getFile()), hints).read(null);

        service = new CalibrationService(new SymphonyCoverageProcessor());
    }

    @Test
    public void calcGlobalIndices() {
        var bands = new int[]{1, 2, 3}; // N.B: Skip first one
        var result = service.calculateGlobalCommonnessIndices(ecoComponents, bands, 42);
        assertArrayEquals(new double[] {6282201.0, 1.09530434E8, 349100.0}, result, 10.0);
    }
}
