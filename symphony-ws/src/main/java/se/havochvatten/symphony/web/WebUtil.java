package se.havochvatten.symphony.web;

import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.renderer.lite.gridcoverage2d.GridCoverageRenderer;
import org.geotools.sld.SLDConfiguration;
import org.geotools.styling.*;
import org.geotools.xsd.Configuration;
import org.geotools.xsd.Parser;
import org.locationtech.jts.geom.Envelope;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.xml.sax.SAXException;

import javax.imageio.ImageIO;
import javax.json.Json;
import javax.json.JsonArray;
import javax.media.jai.InterpolationNearest;
import javax.xml.parsers.ParserConfigurationException;
import java.awt.*;
import java.awt.image.RenderedImage;
import java.io.*;
import java.util.List;

public interface WebUtil {
    int ONE_YEAR_IN_SECONDS = 31536000;

    static JsonArray createExtent(Envelope targetEnvelope) {
        return Json.createArrayBuilder(List.of(targetEnvelope.getMinX(), targetEnvelope.getMinY(),
                targetEnvelope.getMaxX(), targetEnvelope.getMaxY())).build();
    }

    static StyledLayerDescriptor getSLD(InputStream in) throws ParserConfigurationException, SAXException,
            IOException {
        Configuration config = new SLDConfiguration();
        Parser parser = new Parser(config);
        StyledLayerDescriptor sld = (StyledLayerDescriptor) parser.parse(in);
        return sld;
    }

    static List<Rule> getRules(StyledLayerDescriptor sld) {
        NamedLayer layer = (NamedLayer) sld.getStyledLayers()[0];
        Style style = layer.getStyles()[0];
        List<FeatureTypeStyle> featureTypeStyles = style.featureTypeStyles();
        //        assertEquals(1, featureTypeStyles.size());
        return featureTypeStyles.get(0).rules();
    }

    static RenderedImage render(GridCoverage2D cov, CoordinateReferenceSystem crs, Envelope env,
                                StyledLayerDescriptor sld) throws Exception {
        GridCoverageRenderer renderer = new GridCoverageRenderer(crs, env,
                cov.getGridGeometry().getGridRange2D(), null);
        RasterSymbolizer symbolizer = WebUtil.getRasterSymbolizer(sld);
        return renderer.renderImage(cov, symbolizer, new InterpolationNearest(), new Color(0, 0, 0, 0), 0,
                0); // no tiles
    }

    static ByteArrayOutputStream encode(RenderedImage image, String formatName) throws IOException {
        var baos = new ByteArrayOutputStream( // conservative estimate:
                image.getHeight() * image.getWidth() * image.getSampleModel().getNumDataElements());
        var bos = new BufferedOutputStream(baos,
                image.getHeight() * image.getWidth() * image.getSampleModel().getNumDataElements());
        ImageIO.write(image, formatName, bos);
        bos.close();
        return baos;
    }

    static RasterSymbolizer getRasterSymbolizer(StyledLayerDescriptor sld) {
        List<Rule> rules = getRules(sld);
        //        assertEquals(1, rules.size());
        List<Symbolizer> symbolizers = rules.get(0).symbolizers();
        //        assertEquals(1, symbolizers.size());
        //        assertThat(symbolizers.get(0), instanceOf(RasterSymbolizer.class));
        return (RasterSymbolizer) symbolizers.get(0);
    }

    static void writeFile(byte[] content, File file) throws IOException {
        if (!file.exists())
            file.createNewFile();

        FileOutputStream fop = new FileOutputStream(file);
        fop.write(content);
        fop.close();
    }
}
