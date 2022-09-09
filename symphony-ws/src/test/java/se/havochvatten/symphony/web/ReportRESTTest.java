package se.havochvatten.symphony.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import se.havochvatten.symphony.dto.MatrixParameters;
import se.havochvatten.symphony.dto.ScenarioDto;
import se.havochvatten.symphony.scenario.ScenarioRESTTest;

import java.io.IOException;
import java.util.stream.IntStream;

import static io.restassured.RestAssured.given;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class ReportRESTTest extends RESTTest {
    static String sessionCookieValue;
    private static int testScenarioId;
    static int reportId;

    private static ObjectMapper mapper = new ObjectMapper();

    @BeforeClass
    public static void doCalculation() throws IOException {
        var testScenario = ScenarioDto.createWithoutId("TEST-SCENARIO",
            makeBaseline(),
            mapper.readTree(ScenarioRESTTest.class.getClassLoader()
                .getResourceAsStream("polygons/test.geojson")),
            getDomainNormalization());
        var resp = ScenarioRESTTest.create(testScenario);
        testScenario = resp.as(ScenarioDto.class);
        testScenarioId = testScenario.id;

        testScenario.ecosystemsToInclude = IntStream.range(0, 35).toArray();
        testScenario.pressuresToInclude = IntStream.range(0, 41).toArray();
        testScenario.matrix = new MatrixParameters(78);

        Response response =
            given().
                header("Content-Type", "application/json").
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                body(testScenario).
                post(endpoint("/calculation/sum/CumulativeImpact"));
        assertEquals(200, response.statusCode());

        sessionCookieValue = response.getCookie(SESSION_COOKIE_NAME);
        reportId = response.jsonPath().getInt("id");
    }

    @Test
    public void getWrongReport() {
        given().
            pathParam("id", "-1"). // Bogus id
            cookie(SESSION_COOKIE_NAME, sessionCookieValue).
            when().
            get("/report/{id}").
            then().
            statusCode(204);
    }

//    @Test
//    public void getCalculation() {
//        var json = given().
//                pathParam("id", reportId).
//                cookie(SESSION_COOKIE_NAME, sessionCookieValue).
//        when().
//                get(endpoint("/calculation/{id}")).
//        then().
//                statusCode(200).
//                extract().jsonPath();
//        assertEquals(reportId, json.getString("id"));
//    }

    @Test
    public void getReport() {
        Response resp =
            given().
                pathParam("id", reportId).
                cookie(SESSION_COOKIE_NAME, sessionCookieValue).
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                get(endpoint("/report/{id}"));

        assertEquals(200, resp.statusCode());
        JsonPath jp = resp.jsonPath();
        assertEquals("TEST-SCENARIO", jp.getString("name"));
    }

    @Test
    public void getComparisonReport() {
        Response resp =
            given().
                pathParam("id", reportId).
                cookie(SESSION_COOKIE_NAME, sessionCookieValue).
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                get(endpoint("/report/comparison/{id}/{id}"));

        assertEquals(200, resp.statusCode());
        JsonPath jp = resp.jsonPath();
        assertEquals(0.0, jp.getDouble("a.total") - jp.getDouble("b.total"), 0.001);
    }

    @Test
    public void getResultImage() {
        given().
            pathParam("id", reportId).
            cookie(SESSION_COOKIE_NAME, sessionCookieValue).
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            when().
            get("/calculation/{id}/image").
            then().
            statusCode(200).
            contentType("image/png");
    }

    @Test
    public void testGetResultGeoTIFFImage() {
        given().
            pathParam("id", reportId).
            cookie(SESSION_COOKIE_NAME, sessionCookieValue).
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            when().
            get("/report/{id}/geotiff").
            then().
            statusCode(200).
            contentType("image/geotiff");
    }

    @Test
    public void testGetResultCSV() {
        var body =
            given().
                pathParam("id", reportId).
                cookie(SESSION_COOKIE_NAME, sessionCookieValue).
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                get("/report/{id}/csv").
                then().
                statusCode(200).
                contentType("text/plain").
                extract().body();

        assertTrue(body.asString().startsWith("TEST-SCENARIO"));
    }

    @AfterClass
    public static void cleanup() {
        if (testScenarioId != 0) {
            given().
                auth().
                preemptive().
                basic(getAdminUsername(), getAdminPassword()).
                pathParam("id", testScenarioId).
                when().
                delete(endpoint("/testutilapi/scenario/{id}")).
                then().
                statusCode(200);
        }
    }
}
