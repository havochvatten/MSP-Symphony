package se.havochvatten.symphony.web;

import org.junit.Test;

import static io.restassured.RestAssured.given;
import static org.junit.Assert.assertEquals;

public class LegendRESTTest extends RESTTest {
    @Test
    public void getWrongLegend() {
        given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            pathParam("type", "foobar"). // Bogus type
            when().
            get("/legend/{type}").
            then().
            statusCode(204);
    }

    @Test
    public void getResultLegend() {
        var json = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            pathParam("type", "result").
            when().
            get("/legend/{type}").
            then().
            statusCode(200).
            extract().
            jsonPath();

        assertEquals("%", json.getString("unit"));
    }
}
