package se.havochvatten.symphony.web;

import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import se.havochvatten.symphony.dto.CalculationAreaDto;
import se.havochvatten.symphony.dto.SensMatrixDto;
import se.havochvatten.symphony.util.SymphonyDtoUtil;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;

public class SensMatrixRESTTest extends RESTTest {
    private final String BASELINE_NAME = "BASELINE2019";
    private final String SENSMATRIX_NAME = "SENSMATRIX_REST_TEST";

    @Before
    public void setUp() {
        cleanUp();
    }

    @After
    public void afterTests() {
        cleanUp();
    }

    @Test
    public void sensitivitymatrix_GET() {
        String endpoint = endpoint("/sensitivitymatrix/{baselineName}");

        List<SensMatrixDto> res = given().
            auth().
            preemptive().
            basic(getAdminUsername(), getAdminPassword()).
            pathParam("baselineName", BASELINE_NAME).
            when().
            get(endpoint).
            then().
            extract().
            body().
            jsonPath().getList(".", SensMatrixDto.class);

        Assert.assertNotNull(res);
        Assert.assertTrue(res.size() > 0);

    }

    @Test
    public void userMatrixAndAreaCreateGetDelete() throws IOException {
        String endpoint = endpoint("/sensitivitymatrix/{baselineName}/{areaid}");

        SensMatrixDto sensMatrixDto = SymphonyDtoUtil.createSensMatrixDto(SENSMATRIX_NAME);
        int calculationAreaId = getCalculationAreaId();

        // Create
        Response response = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            pathParam("baselineName", BASELINE_NAME).
            pathParam("areaid", calculationAreaId).
            when().
            header("Content-Type", "application/json").
            body(sensMatrixDto).
            post(endpoint);

        assertThat(response.getStatusCode(), is(201));
        SensMatrixDto createdSensMatrixDto = response.jsonPath().getObject("", SensMatrixDto.class);
        int createdSensMatrixDtoId = createdSensMatrixDto.getId();

        // Get created for user
        response = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            pathParam("baselineName", BASELINE_NAME).
            when().
            get(endpoint("/sensitivitymatrix/user/{baselineName}"))
        ;

        assertThat(response.getStatusCode(), is(200));
        List<SensMatrixDto> sensMatrixDtos = response.jsonPath().getList(".", SensMatrixDto.class);
        Assert.assertNotNull(sensMatrixDtos);
        Assert.assertTrue(sensMatrixDtos.size() > 0);

        // Also get by id
        response = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            pathParam("id", createdSensMatrixDtoId).
            when().
            get(endpoint("/sensitivitymatrix/id/{id}"))
        ;

        assertThat(response.getStatusCode(), is(200));
        SensMatrixDto sensMatrixDtoWithId = response.jsonPath().getObject("", SensMatrixDto.class);
        assertThat(sensMatrixDtoWithId.getId(), is(createdSensMatrixDtoId));

        boolean createdSensMatrixIdFound =
            sensMatrixDtos.stream().anyMatch(s -> s.getId() == createdSensMatrixDtoId);
        Assert.assertTrue(createdSensMatrixIdFound);

        // Update SensMatrix
        sensMatrixDto.getSensMatrix().getRows().get(0).getColumns().get(0).setValue(BigDecimal.valueOf(0.123));
        sensMatrixDto.setName(endpoint);
        response = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            pathParam("id", createdSensMatrixDtoId).
            when().
            header("Content-Type", "application/json").
            body(sensMatrixDto).
            put(endpoint("/sensitivitymatrix/{id}"));
        assertThat(response.getStatusCode(), is(200));
        SensMatrixDto sensMatrixDtoUpd = response.jsonPath().getObject("", SensMatrixDto.class);
        assertThat(sensMatrixDtoUpd.getSensMatrix().getRows().get(0).getColumns().get(0).getValue(),
            is(BigDecimal.valueOf(0.123d)));


        // Delete
        response = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            pathParam("matrixid", createdSensMatrixDtoId).
            when().
            delete(endpoint("/sensitivitymatrix/withcalcareasens/{matrixid}"));

        assertThat(response.getStatusCode(), is(200));
    }

    private int getCalculationAreaId() {
        String endpoint = endpoint("/calculationarea/all/{baselineName}");

        JsonPath jsonPath = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            pathParam("baselineName", BASELINE_NAME).
            when().
            get(endpoint).
            then().
            extract().
            body().jsonPath();
        var calculationAreas = jsonPath.getList("", CalculationAreaDto.class);
        return calculationAreas.get(0).getId();
    }

    private void cleanUp() {
        Response response = given().
            auth().
            preemptive().
            basic(getAdminUsername(), getAdminPassword()).
            pathParam("name", SENSMATRIX_NAME).
            when().
            delete(endpoint("/testutilapi/sensitivitymatrix/sensmatrixandcalcareasensmatrix/{name}"));

        assertThat(response.getStatusCode(), is(200));
    }
}
