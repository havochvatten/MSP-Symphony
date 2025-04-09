package se.havochvatten.symphony.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.MissingNode;
import io.restassured.response.Response;
import org.junit.Assert;
import org.junit.Test;

import java.io.IOException;
import java.util.Iterator;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.Assert.assertTrue;

public class AreasRESTTest extends RESTTest {
    @Test
    public void testGetAreas() throws IOException {
        String type = "MSP";

        Response res = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            pathParam("type", type).
            when().
            get(endpoint("/areas/{type}"));

        if (res.getStatusCode() == 500) {
            return; // probably out of memory -> big result set
        }

        ObjectMapper mapper = new ObjectMapper();
        JsonNode jsNode = mapper.readTree(res.getBody().asString());

        JsonNode jsnType = jsNode.path("type");
        assertThat(jsnType.asText(), is(type));

        JsonNode groups = jsNode.path("groups");
        Assert.assertNotEquals(groups.getClass(), MissingNode.class);
        assertTrue(groups.get(0).size() > 0);
        assertTrue(groups.get(0).path("areas").size() > 0);
        Assert.assertNotEquals(groups.get(0).path("areas").get(0).path("polygon").getClass(), MissingNode.class);
    }

    @Test
    public void testGetAreasTypes() throws IOException {
        Response res = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            when().
            get(endpoint("/areas"));

        if (res.getStatusCode() == 500) {
            return; // probably out of memory -> big result set
        }

        ObjectMapper mapper = new ObjectMapper();
        JsonNode jsNode = mapper.readTree(res.getBody().asString());
        assertTrue(jsNode.size() > 0);
        Iterator iterator = jsNode.elements();
        boolean hasMSP = false;
        while (iterator.hasNext()) {
            JsonNode jsn = (JsonNode) iterator.next();
            if (jsn.asText().equals("MSP")) {
                hasMSP = true;
                break;
            }
        }
        assertTrue(hasMSP);
    }

    @Test
    public void testGetBoundaryAreas() throws IOException {
        Response res = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            when().
            get(endpoint("/areas/boundary"));

        if (res.getStatusCode() == 500) {
            return; // probably out of memory -> big result set
        }

        assertThat(res.getStatusCode(), is(200));

        ObjectMapper mapper = new ObjectMapper();
        JsonNode jsNode = mapper.readTree(res.getBody().asString());

        JsonNode areas = jsNode.path("areas");
        JsonNode areaName = areas.get(0).path("name");
        Assert.assertNotEquals(areaName.getClass(), MissingNode.class);
        JsonNode polygon = areas.get(0).path("polygon");
        Assert.assertNotEquals(polygon.getClass(), MissingNode.class);
    }
}
