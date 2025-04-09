package se.havochvatten.symphony.web;

import io.restassured.response.Response;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import se.havochvatten.symphony.dto.AreaTypeDto;
import se.havochvatten.symphony.entity.AreaType;

import java.util.List;

import static io.restassured.RestAssured.given;
import static org.junit.Assert.*;

/**
 *
 */
public class AreaTypeRESTTest extends RESTTest {
    String endpoint = endpoint("/areatype");
    String areaTypeName = "RESTTestAreaType";
    String areaTypeNameUpdate = "RESTTestAreaTypeUpd";

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
        Response response = given().
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                get(endpoint);


        assertEquals(200, response.getStatusCode());

        try {
            List<AreaTypeDto> areaTypes = response.getBody().jsonPath().getList("", AreaTypeDto.class);
            assertFalse(areaTypes.isEmpty());
        } catch (Exception e) {
            System.out.println(e.toString());
        }

    }

    @Test
    public void testCreateDelete() {
        AreaType areaType = new AreaType();
        areaType.setAtypeName(areaTypeName);
        Response response = given().
                auth().
                preemptive().
                basic(getAdminUsername(), getAdminPassword()).
                when().
                header("Content-Type", "application/json").
                body(areaType).
                post(endpoint);

        assertEquals(201, response.getStatusCode());
        AreaType areaTypeResp = response.as(AreaType.class);
        assertEquals(areaTypeResp.getAtypeName(), areaTypeName);

        AreaType updAreaType = updateAreaType(areaTypeResp);
        assertEquals(updAreaType.getAtypeName(), areaTypeNameUpdate);

        Integer id = areaTypeResp.getId();
        boolean deleted = deleteAreaType(id);
        assertTrue(deleted);

    }

    private AreaType updateAreaType(AreaType areaType) {
        Integer id = areaType.getId();
        areaType.setAtypeName(areaTypeNameUpdate);

        Response response = given().
                auth().
                preemptive().
                basic(getAdminUsername(), getAdminPassword()).
                pathParam("id", id).
                when().
                header("Content-Type", "application/json").
                body(areaType).
                put(endpoint + "/{id}");

        assertEquals(200, response.getStatusCode());
        return response.getBody().jsonPath().getObject("", AreaType.class);
    }

    private boolean deleteAreaType(Integer id) {
        Response response = given().
                auth().
                preemptive().
                basic(getAdminUsername(), getAdminPassword()).
                pathParam("id", id).
                when().
                delete(endpoint + "/{id}");

        return response.getStatusCode() == 200;
    }

    private void cleanUp() {
        Response response = given().
                auth().
                preemptive().
                basic(getAdminUsername(), getAdminPassword()).
                pathParam("name", areaTypeName).
                when().
                delete(endpoint("/testutilapi/areatype/{name}"));

        assertEquals(200, response.getStatusCode());
    }
}
