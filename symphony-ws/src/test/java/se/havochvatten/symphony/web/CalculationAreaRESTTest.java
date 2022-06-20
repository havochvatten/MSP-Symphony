package se.havochvatten.symphony.web;

import com.fasterxml.jackson.databind.JsonNode;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import se.havochvatten.symphony.dto.CalculationAreaDto;
import se.havochvatten.symphony.dto.SensMatrixDto;
import se.havochvatten.symphony.dto.UserLoginDto;

import java.util.List;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;

public class CalculationAreaRESTTest extends RESTTest {
    String baselineName = "BASELINE2019";

    @Before
    public void before() {
        String endpoint = endpoint("/login");

        String uid = getUsername();
        String pwd = getPassword();
        UserLoginDto userLogin = new UserLoginDto();
        userLogin.setUsername(uid);
        userLogin.setPassword(pwd);

        Response response = given().
                when().
                header("Content-Type", "application/json").
                body(userLogin).
                post(endpoint);
        assertThat(response.getStatusCode(), is(200));
    }


    @Test
    public void calculationareas_GET_ALL() {
        String endpoint = endpoint("/calculationarea/all/{baselineName}");

        JsonPath jsonPath = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                pathParam("baselineName", baselineName).
                when().
                get(endpoint).
                then().
                extract().
                body().jsonPath();
        List<CalculationAreaDto> calculationAreas = jsonPath.getList("", CalculationAreaDto.class);
        Assert.assertNotNull(calculationAreas);
        Assert.assertTrue(calculationAreas.size() > 0);
    }

    @Test
    public void calculationareas_GET_BY_ID() {

        // first get all to get a list of id:s
        String endpoint = endpoint("/calculationarea/all/{baselineName}");
        JsonPath jsonPath = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                pathParam("baselineName", baselineName).
                when().
                get(endpoint).
                then().
                extract().
                body().jsonPath();
        List<CalculationAreaDto> calculationAreas = jsonPath.getList("", CalculationAreaDto.class);
        Assert.assertNotNull(calculationAreas);
        Assert.assertTrue(calculationAreas.size() > 0);

        // retrieve all of them with id
        Boolean foundError = false;
        for (CalculationAreaDto calcArea : calculationAreas) {
            Integer id = calcArea.getId();
            CalculationAreaDto fetchedCalulationArea = given().
                    auth().
                    preemptive().
                    basic(getUsername(), getPassword()).
                    when().
                    pathParam("id", id).
                    get("/calculationarea/{id}").
                    then().
                    extract().
                    body().as(CalculationAreaDto.class);
            if (!fetchedCalulationArea.getId().equals(id)) {
                foundError = true;
            }
        }
        Assert.assertFalse(foundError);
    }

    @Test
    public void calculationareas_CREATE() {

        String endpoint = endpoint("/calculationarea");

        CalculationAreaDto ca = new CalculationAreaDto();
        ca.setCareaDefault(false);
        ca.setName("TEST");
        ca.setDefaultSensitivityMatrixId(getASensMatrixId());

        // create
        Response response = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                header("Content-Type", "application/json").
                body(ca).
                post(endpoint);

        assertThat(response.getStatusCode(), is(201));


        CalculationAreaDto created_CalculationArea = response.getBody().as(CalculationAreaDto.class);
        Assert.assertNotNull(created_CalculationArea);
        Integer createdId = created_CalculationArea.getId();

        // retrieve to verify that it exists in db
        CalculationAreaDto fetchedCalulationArea = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                pathParam("id", createdId).
                get("/calculationarea/{id}").
                then().
                extract().
                body().as(CalculationAreaDto.class);
        Assert.assertNotNull(fetchedCalulationArea);
        Assert.assertEquals(createdId, fetchedCalulationArea.getId());

        // remove it
        response = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                pathParam("id", createdId).
                delete("/calculationarea/{id}");
        Assert.assertEquals(200, response.getStatusCode());

        // verify that it is gone
        response = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                pathParam("id", createdId).
                get("/calculationarea/{id}");
        Assert.assertNotNull(response);
        JsonNode body = response.getBody().as(JsonNode.class);
        Assert.assertNotNull(body);
        String errorCode = body.path("errorCode").asText();
        Assert.assertEquals("CALCULATION_AREA_NOT_FOUND", errorCode);
    }

    @Test
    public void calculationareas_DELETE() {

        String endpoint = endpoint("/calculationarea");

        CalculationAreaDto ca = new CalculationAreaDto();
        ca.setCareaDefault(false);
        ca.setName("TEST");
        ca.setDefaultSensitivityMatrixId(getASensMatrixId());

        // create
        Response response = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                header("Content-Type", "application/json").
                body(ca).
                post(endpoint);

        assertThat(response.getStatusCode(), is(201));
        CalculationAreaDto created_CalculationArea = response.getBody().as(CalculationAreaDto.class);
        Integer createdId = created_CalculationArea.getId();

        // remove it
        response = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                pathParam("id", createdId).
                delete("/calculationarea/{id}");
        Assert.assertEquals(200, response.getStatusCode());

        // verify that it is gone
        response = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                pathParam("id", createdId).
                get("/calculationarea/{id}");
        Assert.assertNotNull(response);
        JsonNode body = response.getBody().as(JsonNode.class);
        Assert.assertNotNull(body);
        String errorCode = body.path("errorCode").asText();
        Assert.assertEquals("CALCULATION_AREA_NOT_FOUND", errorCode);
    }

    @Test
    public void calculationareas_UPDATE() {

        String endpoint = endpoint("/calculationarea");

        CalculationAreaDto ca = new CalculationAreaDto();
        ca.setCareaDefault(false);
        ca.setName("TEST");
        ca.setDefaultSensitivityMatrixId(getASensMatrixId());

        // create
        Response response = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                header("Content-Type", "application/json").
                body(ca).
                post(endpoint);

        assertThat(response.getStatusCode(), is(201));

        CalculationAreaDto created_CalculationArea = response.getBody().as(CalculationAreaDto.class);
        Assert.assertNotNull(created_CalculationArea);
        Integer createdId = created_CalculationArea.getId();

        // retrieve to verify that it exists in db
        CalculationAreaDto fetchedCalculationArea = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                pathParam("id", createdId).
                get("/calculationarea/{id}").
                then().
                extract().
                body().as(CalculationAreaDto.class);
        Assert.assertNotNull(fetchedCalculationArea);
        Assert.assertEquals(createdId, fetchedCalculationArea.getId());

        // update it
        fetchedCalculationArea.setName("TESTUPDATE");
        response = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                header("Content-Type", "application/json").
                body(fetchedCalculationArea).
                pathParam("id", createdId).
                put("/calculationarea/{id}");

        assertThat(response.getStatusCode(), is(200));

        // retrieve it
        CalculationAreaDto fetched2CalculationArea = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                pathParam("id", createdId).
                get("/calculationarea/{id}").
                then().
                extract().
                body().as(CalculationAreaDto.class);
        Assert.assertNotNull(fetched2CalculationArea);
        Assert.assertEquals("TESTUPDATE", fetched2CalculationArea.getName());

        // TODO
        // compare

        // remove it
        response = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                pathParam("id", createdId).
                delete("/calculationarea/{id}");
        Assert.assertEquals(200, response.getStatusCode());

        // verify that it is gone
        response = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                pathParam("id", createdId).
                get("/calculationarea/{id}");
        Assert.assertNotNull(response);
        JsonNode body = response.getBody().as(JsonNode.class);
        Assert.assertNotNull(body);
        String errorCode = body.path("errorCode").asText();
        Assert.assertEquals("CALCULATION_AREA_NOT_FOUND", errorCode);
    }

    private int getASensMatrixId() {
        String endpoint = endpoint("/sensitivitymatrix/{baselineName}");

        List<SensMatrixDto> res = given().
                auth().
                preemptive().
                basic(getAdminUsername(), getAdminPassword()).
                pathParam("baselineName", baselineName).
                when().
                get(endpoint).
                then().
                extract().
                body().
                jsonPath().getList(".", SensMatrixDto.class);

        Assert.assertNotNull(res);
        Assert.assertTrue(res.size() > 0);
        return res.get(0).getId();
    }
}
