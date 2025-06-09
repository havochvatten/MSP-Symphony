package se.havochvatten.symphony.web;

import io.restassured.RestAssured;
import io.restassured.config.ObjectMapperConfig;
import io.restassured.parsing.Parser;
import org.geotools.geometry.jts.JTSFactoryFinder;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LinearRing;
import org.locationtech.jts.geom.Polygon;
import se.havochvatten.symphony.appconfig.ObjectMapperConfiguration;
import se.havochvatten.symphony.dto.NormalizationOptions;
import se.havochvatten.symphony.dto.NormalizationType;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.service.PropertiesService;

import java.util.Date;

public abstract class RESTTest {
    private static final PropertiesService props = new PropertiesService();

    protected static final String SESSION_COOKIE_NAME = "JSESSIONID";

    static {
        RestAssured.baseURI = getSymphonyOrSystemProperty("api.base_url");
        RestAssured.basePath = getSymphonyOrSystemProperty("api.base_path");
        RestAssured.defaultParser = Parser.JSON;
        RestAssured.config = RestAssured.config().objectMapperConfig(
            ObjectMapperConfig.objectMapperConfig()
                .jackson2ObjectMapperFactory(
                    (type, s) -> new ObjectMapperConfiguration().getContext(type.getClass())
                ));
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
        baselineVersion.setId(3);
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
}
