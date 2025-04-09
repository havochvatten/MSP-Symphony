package se.havochvatten.symphony.web;

import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import se.havochvatten.symphony.dto.CalcAreaSensMatrixDto;
import se.havochvatten.symphony.dto.CalculationAreaDto;
import se.havochvatten.symphony.dto.SensMatrixDto;
import se.havochvatten.symphony.entity.CalculationArea;
import se.havochvatten.symphony.mapper.CalculationAreaMapper;

import java.util.List;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.Assert.assertTrue;

public class CalcAreaSensMatrixRESTTest extends RESTTest {
    String endpoint = endpoint("/calculationareasensmatrix");
    String comment = "CalcAreaSensMatrixRESTTest";
    String updComment = "CalcAreaSensMatrixRESTTestUpd";

    @Before
    public void setUp() {
        cleanUp();
    }

    @After
    public void afterTests() {
        cleanUp();
    }

    @Test
    public void testFindAll() {
        List<CalcAreaSensMatrixDto> calcAreaSensMatrices = getCalcAreaSensMatrices();
        assertTrue(calcAreaSensMatrices.size() > 0);
    }

    @Test
    public void testCreateUpdateDelete() {
        CalculationArea calculationArea = getCalculationArea();
        SensMatrixDto sensMatrixDto = getSensMatrixDto(calculationArea.getId());
        CalcAreaSensMatrixDto calcAreaSensMatrixDto = new CalcAreaSensMatrixDto();
        calcAreaSensMatrixDto.setCalcareaId(calculationArea.getId());
        calcAreaSensMatrixDto.setSensmatrixId(sensMatrixDto.getId());
        calcAreaSensMatrixDto.setComment(comment);

        Response response = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                header("Content-Type", "application/json").
                body(calcAreaSensMatrixDto).
                post(endpoint);

        assertThat(response.getStatusCode(), is(201));
        CalcAreaSensMatrixDto casm = response.getBody().jsonPath().getObject("", CalcAreaSensMatrixDto.class);
        assertThat(casm.getComment(), is(comment));

        CalcAreaSensMatrixDto updCalcAreaSensMatrixDto = updateCalcAreaSensMatrixDto(casm);
        assertThat(updCalcAreaSensMatrixDto.getComment(), is(updComment));

        Integer casmId = casm.getId();
        boolean deleted = deleteCalcAreaSensMatrix(casmId);
        assertTrue(deleted);

    }

    private CalcAreaSensMatrixDto updateCalcAreaSensMatrixDto(CalcAreaSensMatrixDto userDefinedAreaDto) {
        Integer id = userDefinedAreaDto.getId();
        userDefinedAreaDto.setComment(updComment);

        Response response = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                pathParam("id", id).
                when().
                header("Content-Type", "application/json").
                body(userDefinedAreaDto).
                put(endpoint + "/{id}");

        assertThat(response.getStatusCode(), is(200));
        return response.getBody().jsonPath().getObject("", CalcAreaSensMatrixDto.class);
    }

    private boolean deleteCalcAreaSensMatrix(Integer id) {
        Response response = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                pathParam("id", id).
                when().
                delete(endpoint + "/{id}");

        return response.getStatusCode() == 200;
    }

    private SensMatrixDto getSensMatrixDto(Integer calcAreaId) {
        SensMatrixDto sensMatrixDto = null;

        String mxEndpoint = endpoint("/sensitivitymatrix/{baselineName}");
        String baselineName = "BASELINE2019";

        List<SensMatrixDto> sensMatrixDtos = given().
                auth().
                preemptive().
                basic(getAdminUsername(), getAdminPassword()).
                pathParam("baselineName", baselineName).
                when().
                get(mxEndpoint).
                then().
                extract().
                body().
                jsonPath().getList(".", SensMatrixDto.class);


        for (SensMatrixDto s : sensMatrixDtos) {
            if (!combinationExtstsInCalcAreaSensMatrices(calcAreaId, s.getId())) {
                sensMatrixDto = s;
                break;
            }
        }
        return sensMatrixDto;
    }

    private CalculationArea getCalculationArea() {
        CalculationArea calculationArea = null;
        String baselineName = "BASELINE2019";

        Response response = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                pathParam("baselineName", baselineName).
                when().
                get(endpoint("/calculationarea/all/{baselineName}"));


        assertThat(response.getStatusCode(), is(200));
        JsonPath jsonPathEvaluator = response.jsonPath();
        List<CalculationAreaDto> calculationAreas = jsonPathEvaluator.getList("", CalculationAreaDto.class);
        if (calculationAreas.size() > 0) {

            calculationArea = CalculationAreaMapper.mapToEntity(calculationAreas.get(0), null);
        }
        return calculationArea;
    }

    private boolean combinationExtstsInCalcAreaSensMatrices(Integer calcAreaId, Integer sensMatrixId) {
        List<CalcAreaSensMatrixDto> calcAreaSensMatrices = getCalcAreaSensMatrices();
        return calcAreaSensMatrices.stream().anyMatch(c -> c.getCalcareaId() != null && c.getCalcareaId().equals(calcAreaId) && c.getSensmatrixId() != null &&
                c.getSensmatrixId().equals(sensMatrixId));
    }

    private List<CalcAreaSensMatrixDto> getCalcAreaSensMatrices() {
        Response response = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                get(endpoint);

        int sts = response.getStatusCode();
        assertThat(sts, is(200));

        JsonPath jsonPathEvaluator = response.jsonPath();
        return jsonPathEvaluator.getList("", CalcAreaSensMatrixDto.class);
    }

    private void cleanUp() {
        Response response = given().
                auth().
                preemptive().
                basic(getAdminUsername(), getAdminPassword()).
                pathParam("comment", comment).
                when().
                delete(endpoint("/testutilapi/calculationareasensmatrix/{comment}"));

        assertThat(response.getStatusCode(), is(200));
    }
}
