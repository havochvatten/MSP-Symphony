package se.havochvatten.symphony.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.RestAssured;
import io.restassured.parsing.Parser;
import org.geotools.geometry.jts.JTSFactoryFinder;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LinearRing;
import org.locationtech.jts.geom.Polygon;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.dto.NormalizationOptions;
import se.havochvatten.symphony.dto.NormalizationType;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.scenario.ScenarioService;
import se.havochvatten.symphony.service.PropertiesService;

import java.util.Date;

public class RESTTest { // N.B: Must end with Test to be included in "only-apitests" profile
    protected static final Logger LOG = LoggerFactory.getLogger(ScenarioService.class);
    private static ObjectMapper mapper = new ObjectMapper();

    private static PropertiesService props = new PropertiesService();

    protected final static String SESSION_COOKIE_NAME = "JSESSIONID";

    static {
        RestAssured.baseURI = getSymphonyOrSystemProperty("api.base_url");
        RestAssured.basePath = getSymphonyOrSystemProperty("api.base_path");
        RestAssured.defaultParser = Parser.JSON;
    }

    protected static String getUsername() {
        return getSymphonyOrSystemProperty("symphony.username");
    }

    protected static String getPassword() {
        return getSymphonyOrSystemProperty("symphony.password");
    }

    protected static String getAdminUsername() {
        return getSymphonyOrSystemProperty("symphony.adminusername");
    }

    protected static String getAdminPassword() {
        return getSymphonyOrSystemProperty("symphony.adminpassword");
    }

    protected static String getSymphonyOrSystemProperty(String name) {
        if (props.getProperty(name) != null)
            return props.getProperty(name);
        else if (System.getProperty(name) != null)
            return System.getProperty(name);
        else
            throw new RuntimeException("Property " + name + " not found!");
    }

    protected static ObjectMapper getMapper() {
        return mapper;
    }

    protected static String endpoint(String pathSuffix) {
        return RestAssured.baseURI + RestAssured.basePath
            + pathSuffix; // TODO more robust URL join
    }

    public static Polygon makeROI() {
        GeometryFactory geometryFactory = JTSFactoryFinder.getGeometryFactory();

        Coordinate[] coords =
            new Coordinate[]{ // Somewhere in the West sea
                new Coordinate(12.152527, 56.926993),
                new Coordinate(12.276672, 56.934486),
                new Coordinate(12.285461, 56.883801),
                new Coordinate(12.177246, 56.882001),
                new Coordinate(12.152527, 56.926993)
            };

        // Use WKTReader reader = new WKTReader( geometryFactory )? (https://docs.geotools
        // .org/stable/userguide/library/jts/geometry.html)
        LinearRing ring = geometryFactory.createLinearRing(coords);

        return geometryFactory.createPolygon(ring, null);
    }

    public static BaselineVersion makeBaseline() {
        var baselineVersion = new BaselineVersion();
        baselineVersion.setId(1);
        baselineVersion.setName("test");
        baselineVersion.setDescription("test desc");
        baselineVersion.setValidFrom(new Date());
        return baselineVersion;
    }

    public static NormalizationOptions getDomainNormalization() {
        return new NormalizationOptions(NormalizationType.DOMAIN);
    }

    public static NormalizationOptions getAreaNormalization() {
        return new NormalizationOptions(NormalizationType.AREA);
    }

//    public static Geometry getLargerROI() throws ParseException {
//        var reader = new InputStreamReader(
//                ScenarioRESTTest.class.getClassLoader().getResourceAsStream("polygons/test.geojson"));
//        var geometry = new GeoJsonReader().read(reader);
//        return geometry;
//    }
}
