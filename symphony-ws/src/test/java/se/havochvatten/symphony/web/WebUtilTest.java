package se.havochvatten.symphony.web;

import org.junit.Test;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;

import static org.junit.Assert.assertEquals;

public class WebUtilTest {
    @Test
    public void normalizedRasterSymbolizer() throws ParserConfigurationException, IOException, SAXException {
        var resultsSLD = WebUtil.getSLD(WebUtilTest.class.getClassLoader().getResourceAsStream(
            "styles/test-style.xml"));
        double maxValue = 242.0;
        var symbolizer = WebUtil.getNormalizedRasterSymbolizer(resultsSLD, maxValue);
        var firstEntry = symbolizer.getColorMap().getColorMapEntry(0);
        assertEquals(maxValue*1.0, firstEntry.getQuantity().evaluate(null));
    }
}
