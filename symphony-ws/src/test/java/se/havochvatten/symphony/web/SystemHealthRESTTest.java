package se.havochvatten.symphony.web;

import org.junit.Assert;
import org.junit.Test;

import static io.restassured.RestAssured.given;

public class SystemHealthRESTTest extends RESTTest {
    @Test
    public void ping() {
        String endpoint = endpoint("/ping");

        String res = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            when().
            get(endpoint).
            then().
            extract().
            asString();

        Assert.assertEquals("PONG", res);
    }
}
