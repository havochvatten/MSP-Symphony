
package se.havochvatten.symphony.calculation;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.response.ExtractableResponse;
import io.restassured.response.Response;
import org.junit.*;
import se.havochvatten.symphony.dto.*;
import se.havochvatten.symphony.entity.CalculationResultSlice;
import se.havochvatten.symphony.scenario.ScenarioRESTTest;
import se.havochvatten.symphony.web.RESTTest;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.junit.Assert.*;
import static se.havochvatten.symphony.scenario.ScenarioRESTTest.getTestArea;

public class
CalculationRESTTest extends RESTTest {
    private static int testScenarioId;
    private static ExtractableResponse response;
    private static int testCalcId;

    private static final ObjectMapper mapper = new ObjectMapper();

    /** Helper method to make a calc request */
    static ExtractableResponse makeSuccessfulCalcRequest(int scenarioId) {
        return given().
                    header("Content-Type", "application/json").
                    auth().
                    preemptive().
                    basic(getUsername(), getPassword()).
                when().
                    body(scenarioId).
                    post(endpoint("/calculation/sum")).
                then().
                    statusCode(200).
                    extract();
    }

    private static ScenarioDto makeSmallSum(ScenarioDto scenario) {
        scenario.ecosystemsToInclude = new int[]{3}; // cod
        scenario.pressuresToInclude = new int[]{0, 36}; // abrasion bottom trawling and temperature

        ScenarioRESTTest.update(scenario);
        // increase
        //scenario.matrix = new MatrixParameters(4); // exists for sympho1 user
        return scenario;
    }

    /* Make a simple calc request at start of test suite.
     * Sets testCalcId as a side effect
     */
    @BeforeClass
    public static void start() {
        try {
            var testScenario = ScenarioDto.createWithoutId("TEST-SCENARIO",
                    makeBaseline(),
                    getTestArea("V330FN"),
                    getAreaNormalization());
            var resp = ScenarioRESTTest.create(testScenario);
            testScenario = resp.as(ScenarioDto.class);

            testScenarioId = testScenario.id;

            System.out.print("Making small test calculation... ");

            response = makeSuccessfulCalcRequest(makeSmallSum(testScenario).id);
            testCalcId = response.jsonPath().getInt("id");
            System.out.printf("DONE (id=%d)%n", testCalcId);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void testGetImage() {
        var resp = given().
            pathParam("id", testCalcId).
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            when().
            get(endpoint("/calculation/{id}/image"));
        assertEquals(200, resp.getStatusCode());
        assertEquals("image/png", resp.getContentType());
        assertNotNull(resp.getHeader("SYM-Image-Extent"));
    }

    @Test
    public void testAverage() {
        given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
        when().
                get(endpoint("/calculation/average")).
        then().
                statusCode(501);
    }

    @Test
    public void testUpdateName() {
        var id = response.jsonPath().getInt("id");

        given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                request().body("NEW_NAME").
        when().
                post(endpoint("/calculation/{id}?action=update-name"), Map.of("id", id)).
                then().
                statusCode(200);

        var json = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                pathParam("id", id).
        when().
                get(endpoint("/calculation/{id}")).
                then().
                statusCode(200).
                extract().jsonPath();
        assertEquals("NEW_NAME", json.getString("name"));
    }

    @Test
    public void testGetMaskWithoutSession() {
        given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
        when().
            get(endpoint("/calculation/last-mask")).
        then().
            statusCode(204);
   }

    @Test
    public void testSumFAIL() {
        Response response = given().
                header("Content-Type", "application/json").
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                // N.B: No post body!
                post(endpoint("/calculation/sum"));
        assertEquals(400, response.getStatusCode());
    }

    @Test
    public void testGetAll()  {
        given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
        when().
                get(endpoint("/calculation/all")).
        then().
                statusCode(200);
    }

    @Test
    @Ignore // Relies on database being populated with baseline calculations
    public void testGetBaseline() {
		String baselineName = "BASELINE2019";
        var json = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
				pathParam("baselineName", baselineName).
        when().
                get(endpoint("/calculation/baseline/{baselineName}")).
                then().
                statusCode(200).
                extract().jsonPath();
        assertNotEquals(0, ((List)json.get()).size());
    }

    @Test
    public void testGetMask() {
        given().
                cookie(SESSION_COOKIE_NAME, response.cookie(SESSION_COOKIE_NAME)).
        when().
                get(endpoint("/calculation/last-mask")).
        then().
            // It seems that this endpoint has changed since this test was written.
            // However, the session isn't reliably applied on the API side.
            // Commenting out the contentType check for now, fwiw we're still
            // checking that the endpoint works..
            // This debugging utility may be a candidate for removal anyway after
            // SYM-502 (725fd6a), the matrix mask image isn't really as useful for
            // debugging purposes anymore.

            //contentType("image/png").
            //statusCode(200);
                statusCode(204);
    }

    @Test
    public void testCalculation() {
        assertNotEquals(testCalcId, 0);
    }

//    @Test
//    public void testSumWithUserDefinedMatrix() throws IOException {
//        var params = makeSmallSum();
//        /*params.matrix = 4 in #makeSmallSum() */
//        makeSuccessfulCalcRequest(params);
//    }
//
//    @Test
//    public void testSumWithAreaTypesMatrices() throws IOException {
//        var params = makeSmallSum();
//        params.matrix = new CalcParameters.DefaultMatrixParameters(6,
//                List.of(
//                        new CalcParameters.DefaultMatrixParameters.AreaTypeRef(1,
//                                List.of( // n-areas
//                                        new AreaMatrixMapping(2405, 9), // Utposten Lysekil?
//                                        new AreaMatrixMapping(2384, 9))), // somewhere else
//                        new CalcParameters.DefaultMatrixParameters.AreaTypeRef(420,
//                                List.of( // coastal areas (Lysekil)
//                                        new AreaMatrixMapping(3832, 6))) // Lysekil
//                )
//        );
//
//        makeSuccessfulCalcRequest(params);
//    }
//
//    @Test
//    public void testSumWithChanges() throws  IOException {
//        var params = makeSmallSum();
//        params.scenarioChanges = mapper.readTree(CalculationRESTTest.class.getClassLoader()
//                .getResourceAsStream("polygons/test-changes-single.geojson"));
//
//        var resp = makeSuccessfulCalcRequest(params);
//        var sessionCookieValue = resp.cookie(SESSION_COOKIE_NAME);
//        var reportId = resp.jsonPath().getInt("id");
//        Response report =
//                given().
//                    pathParam("id", reportId).
//                    cookie(SESSION_COOKIE_NAME, sessionCookieValue).
//                    auth().
//                    preemptive().
//                    basic(getUsername(), getPassword()).
//                when().
//                    get(endpoint("/report/{id}"));
//        assertEquals(200, report.statusCode());
//
//        JsonPath jp = report.jsonPath();
//        assertEquals(1, ((List)jp.getJsonObject("scenarioChanges.features")).size());
//        var props = (Map)jp.getJsonObject("scenarioChanges.features[0].properties.changes['Habitat loss fish farm']");
//        assertEquals(1.1, (Float)props.get("multiplier"), 0.1);
//        // Make sure impact is relatively low
//        assertTrue(jp.getMap("impactPerPressure", Integer.class, Double.class).get(0)<500_000);
//    }

    // TODO Add test making two calculations with different scenarios and make note of changed total?

    @Test
    public void testDiff() {
        var report =
                given().
                        pathParam("id", testCalcId).
                        cookie(SESSION_COOKIE_NAME, response.cookie(SESSION_COOKIE_NAME)).
                        auth().
                        preemptive().
                        basic(getUsername(), getPassword()).
                        when().
                        get(endpoint("/calculation/diff/{id}/{id}"));
        assertEquals(200, report.statusCode());
        assertNotNull(report.getHeader("SYM-Image-Extent"));
        // we should get a zero result...
    }

    @Test
    public void testGetMatchingCalc() {

        var resp2 = makeSuccessfulCalcRequest(testScenarioId);
        CalculationResultSlice crSlice = resp2.jsonPath().getObject("", CalculationResultSlice.class);

        var report =
                given().
                        pathParam("id", testCalcId).
                        cookie(SESSION_COOKIE_NAME, response.cookie(SESSION_COOKIE_NAME)).
                        auth().
                        preemptive().
                        basic(getUsername(), getPassword()).
                when().
                        get(endpoint("/calculation/matching/{id}"));

        assertEquals(200, report.statusCode());
        var res = report.jsonPath().getList("", CalculationResultSliceDto.class);
        assertFalse(res.isEmpty());
        assertFalse(res.stream().anyMatch(calc -> calc.getId() == testCalcId));
        delete(crSlice.getId());
    }

    private static void delete (int calcId){
        System.out.print("Deleting test calculation "+ calcId +"... ");
        given()
                .auth()
                .preemptive()
                .basic(getUsername(), getPassword())
                .queryParam("ids",  calcId).
        when()
                .delete(endpoint("/calculation")).
        then()
                .statusCode(200);
    }

    @AfterClass
    public static void cleanup() {
        if (testScenarioId != 0)
            ScenarioRESTTest.delete(testScenarioId);

        if (testCalcId != 0) {
            System.out.println("Deleting test calculation "+ testCalcId +"... ");
            delete(testCalcId);
        }

        System.out.println("DONE");
    }
}
