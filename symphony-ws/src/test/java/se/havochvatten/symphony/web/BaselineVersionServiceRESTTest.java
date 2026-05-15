package se.havochvatten.symphony.web;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import se.havochvatten.symphony.dto.BaselineVersionDto;

import java.util.List;

import static io.restassured.RestAssured.given;

public class BaselineVersionServiceRESTTest extends RESTTest {
    private static List<BaselineVersionDto> versions;

    @BeforeClass
    public static void setup() {
        versions = getAllBaselineVersions();
    }

    @Test
    public void testFindAll() {
        Assert.assertFalse(versions.isEmpty());
    }

    @Test
    public void testGetActive() {
        BaselineVersionDto res = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            when().
            get(endpoint("/baselineversion/active")).
            then().
            statusCode(200).
            extract().
            body().
            jsonPath().getObject("", BaselineVersionDto.class);

        Assert.assertFalse(res.getName().isEmpty());
    }

    @Test
    public void testGetByName() {
        BaselineVersionDto res = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            pathParam("name", versions.get(0).getName()).
            when().
            get(endpoint("/baselineversion/name/{name}")).
            then().
            statusCode(200).
            extract().
            body().
            jsonPath().getObject("", BaselineVersionDto.class);

        Assert.assertEquals(res.getName(), versions.get(0).getName());
    }

    private static List<BaselineVersionDto> getAllBaselineVersions() {
        return given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            when().
            get(endpoint("/baselineversion")).
            then().
            extract().
            body().
            jsonPath().getList(".", BaselineVersionDto.class);
    }
}
