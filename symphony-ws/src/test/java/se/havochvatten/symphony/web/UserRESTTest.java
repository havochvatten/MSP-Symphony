package se.havochvatten.symphony.web;

import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import se.havochvatten.symphony.dto.AreaImportResponse;
import se.havochvatten.symphony.dto.UploadedUserDefinedAreaDto;
import se.havochvatten.symphony.dto.UserDefinedAreaDto;

import java.io.File;
import java.net.URISyntaxException;
import java.util.List;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.Assert.*;
import static org.junit.Assert.assertEquals;

public class UserRESTTest extends RESTTest {
    private static String areaName = "UserRESTTest";
    private static String updDecription = "Rest Test Desc Upd";

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
        // First create an area owned by the test user
        createUserDefinedArea();

        Response response = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            when().
            get(endpoint("/user/area/all"));

        JsonPath jsonPathEvaluator = response.jsonPath();
        List<UserDefinedAreaDto> areaList = jsonPathEvaluator.getList("", UserDefinedAreaDto.class);
        assertTrue(areaList.size() > 0);
    }

    @Test
    public void testCreateUpdateDelete() {
        UserDefinedAreaDto udArea = createUserDefinedArea();
        assertThat(udArea.getName(), is(areaName));

        UserDefinedAreaDto udAreaUpdated = updateUserDefinedAreaDto(udArea);
        assertThat(udAreaUpdated.getDescription(), is(updDecription));

        Integer areaId = udArea.getId();
        boolean deleted = deleteUserDefinedArea(areaId);
        assertTrue(deleted);
    }

    @Test
    public void testDeleteMultiple() {
        UserDefinedAreaDto udArea = createUserDefinedArea();
        UserDefinedAreaDto udArea2 = createUserDefinedArea();

        boolean deleted = deleteMultipleUserDefinedAreas(udArea.getId(), udArea2.getId());
        assertTrue(deleted);
    }

    private UserDefinedAreaDto createUserDefinedArea() {
        // Create an area owned by the test user
        Response response = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            when().
            header("Content-Type", "application/json").
            body(createUserDefinedAreaDto()).
            post(endpoint("/user/area"));

        assertThat(response.getStatusCode(), is(201));

        return response.getBody().jsonPath().getObject("", UserDefinedAreaDto.class);
    }


    private UserDefinedAreaDto updateUserDefinedAreaDto(UserDefinedAreaDto userDefinedAreaDto) {
        Integer id = userDefinedAreaDto.getId();
        userDefinedAreaDto.setDescription(updDecription);

        Response response = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            pathParam("id", id).
            when().
            header("Content-Type", "application/json").
            body(userDefinedAreaDto).
            put(endpoint("/user/area/{id}"));

        assertThat(response.getStatusCode(), is(200));
        return response.getBody().jsonPath().getObject("", UserDefinedAreaDto.class);
    }

    private boolean deleteUserDefinedArea(Integer id) {
        Response response = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            pathParam("id", id).
            when().
            delete(endpoint("/user/area/{id}"));

        return response.getStatusCode() == 204;
    }

    private boolean deleteMultipleUserDefinedAreas(int ...ids) {
        Response response = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            queryParam("ids", String.format("%d,%d", ids[0], ids[1])).
            when().
            delete(endpoint("/user/area"));

        return response.getStatusCode() == 204;
    }

    private UserDefinedAreaDto createUserDefinedAreaDto() {
        UserDefinedAreaDto userDefinedAreaDto = new UserDefinedAreaDto();
        userDefinedAreaDto.setId(0);
        userDefinedAreaDto.setName(areaName);
        userDefinedAreaDto.setDescription("Rest Test Desc");
        Object polygon = "{\"type\": \"Polygon\", \"coordinates\": [ [ [ 728177.201475343783386, 6959591" +
            ".645440044812858 ], \n" +
            "[ 724608.070458921603858, 6948060.606771603226662 ], [ 743277.371160206850618, 6949707" +
            ".898009952157736 ], \n" +
            "[ 728177.201475343783386, 6959591.645440044812858 ]]]}";
        userDefinedAreaDto.setPolygon(polygon);
        return userDefinedAreaDto;
    }

    private Response deleteUserDefinedAreaByName(String name) {
        return given().
            auth().
            preemptive().
            basic(getAdminUsername(), getAdminPassword()).
            pathParam("name", name).
            when().
            delete(endpoint("/testutilapi/userdefinedarea/{name}"));
    }

    private void cleanUp() {
        Response response = deleteUserDefinedAreaByName(areaName);
        assertThat(response.getStatusCode(), is(200));
    }


    @Test
    public void testCreateArrayPolygon() {
        UserDefinedAreaDto dto = createUserDefinedAreaDto();
        Object polygon1 = dto.getPolygon();
        Object polygon2 = dto.getPolygon();
        Object arrayPolygon[] = {polygon1, polygon2};
        dto.setPolygon(arrayPolygon);

        Response response = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            when().
            header("Content-Type", "application/json").
            body(dto).
            post(endpoint("/user/area"));
        assertThat(response.getStatusCode(), is(400));
    }

    @Test
    public void testCreateNonArrayPolygon() {
        UserDefinedAreaDto dto = createUserDefinedAreaDto();

        Response response = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            when().
            header("Content-Type", "application/json").
            body(dto).
            post(endpoint("/user/area"));

		assertThat(response.getStatusCode(), is(201));
	}

    @Test
    public void inspectSomethingThatIsNotAGeoPackage() throws URISyntaxException {
        File pkg = new File(ClassLoader.getSystemResource("geopackage/notageopackage.shp").toURI());

        var result = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            multiPart("package", pkg).
            when().
            post(endpoint("/user/area/import")).
            then().
            statusCode(400).
            extract();
        var json = result.jsonPath();
        assertEquals("NOT_A_GEOPACKAGE", json.getString("errorCode"));
    }

    @Test
    public void inspectEmptyGeoPackage() throws URISyntaxException {
        File pkg = new File(ClassLoader.getSystemResource("geopackage/empty.gpkg").toURI());

        var result = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            multiPart("package", pkg).
            when().
            post(endpoint("/user/area/import")).
            then().
            statusCode(400).
            extract();
        var json = result.jsonPath();
        assertEquals("GEOPACKAGE_NO_FEATURES", json.getString("errorCode"));
    }

	@Test
	public void importGeoPackage() throws URISyntaxException {
		File pkg = new File(ClassLoader.getSystemResource("geopackage/test.gpkg").toURI());

        var result = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            multiPart("package", pkg).
            when().
            post(endpoint("/user/area/import")).
            then().
            statusCode(200).
            extract();

        var dto = result.body().as(UploadedUserDefinedAreaDto.class);
		assertEquals("epsg3006", dto.featureIdentifiers.get(0));

        var result2 = given().
            cookie(SESSION_COOKIE_NAME, result.cookie(SESSION_COOKIE_NAME)).
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            when().
            put(endpoint("/user/area/import/"+dto.key)).
            then().
            statusCode(201).
            extract();

        result2.body().as(AreaImportResponse.class);

        /* clean up db */
        deleteUserDefinedAreaByName("epsg3006");
        deleteUserDefinedAreaByName("espg4326");
	}
}
