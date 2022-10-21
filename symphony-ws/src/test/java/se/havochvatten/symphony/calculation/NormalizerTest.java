package se.havochvatten.symphony.calculation;

import it.geosolutions.jaiext.JAIExt;
import org.geotools.coverage.grid.GridCoordinates2D;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.gce.geotiff.GeoTiffReader;
import org.geotools.util.factory.Hints;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import se.havochvatten.symphony.dto.NormalizationType;

import java.io.File;
import java.io.IOException;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class NormalizerTest {
    public static final double TOL = 0.1;

    NormalizerService factory = new NormalizerService(new Operations());

    GridCoverage2D coverage;

    @Before
    public void setup() throws IOException {
        JAIExt.initJAIEXT();
        /* TODO: Supply a more suitable test raster for the percentile calculation  */
        Hints hints = null; //new Hints(Hints.FORCE_LONGITUDE_FIRST_AXIS_ORDER, Boolean.TRUE);
        coverage = new GeoTiffReader(new File(NormalizerTest.class.getClassLoader().
                getResource("unittest/checkerboard.tif").getFile()), hints).read(null);
    }

    @Test
    public void areaNormalizer() {
        var areaNormalizer = factory.getNormalizer(NormalizationType.AREA);
        var result = areaNormalizer.apply(coverage, 242.0);

        assertEquals(1.0, result.doubleValue(), TOL);
    }

    @Test
    public void domainNormalizer() {
        var val = 10.0;

        var normalizer = factory.getNormalizer(NormalizationType.DOMAIN);
        var result = normalizer.apply(coverage, val);

        assertEquals(10.0, result.doubleValue(), TOL);
    }

    @Test
    public void userDefinedNormalizer() {
        var val = 10.0;

        var normalizer = factory.getNormalizer(NormalizationType.USER_DEFINED);
        var result = normalizer.apply(coverage, val);

        assertEquals(10.0, result.doubleValue(), TOL);
    }

    @Test
    public void percentileNormalizer() {
        factory = mock(NormalizerService.class);
        when(factory.getNormalizer(NormalizationType.PERCENTILE))
                .thenReturn(new PercentileNormalizer(50, new Operations()));

        var normalizer = factory.getNormalizer(NormalizationType.PERCENTILE);
        var result = normalizer.apply(coverage, Double.NaN);

        assertEquals(0.015, result.doubleValue(), TOL); // other bands should remain unchanged
    }
}
