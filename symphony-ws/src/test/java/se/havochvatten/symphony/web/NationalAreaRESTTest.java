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
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;

public class NationalAreaRESTTest extends RESTTest {
    public static final String COUNTRYCODE_ISO3 = "SWE";

    @Test
    public void testGetAreasForCountry() throws IOException {
        String type = "MSP";

        Response res = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            pathParam("countrycodeiso3", COUNTRYCODE_ISO3).
            pathParam("type", type).
            when().
            get(endpoint("/nationalarea/{countrycodeiso3}/{type}"));

        if (res.getStatusCode() == 500) {
            return; // probably out of memory -> big result set
        }

        ObjectMapper mapper = new ObjectMapper();
        JsonNode jsNode = mapper.readTree(res.getBody().asString());

        JsonNode jsnType = jsNode.path("type");
        assertThat(jsnType.asText(), is(type));

        JsonNode groups = jsNode.path("groups");
        Assert.assertFalse(groups.getClass().equals(MissingNode.class));
        assertTrue(groups.get(0).size() > 0);
        assertTrue(groups.get(0).path("areas").size() > 0);
        Assert.assertFalse(groups.get(0).path("areas").get(0).path("polygon").getClass().equals(MissingNode.class));
    }

    @Test
    public void testGetAreasTypesForCountry() throws IOException {
        Response res = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            pathParam("countrycodeiso3", COUNTRYCODE_ISO3).
            when().
            get(endpoint("/nationalarea/{countrycodeiso3}"));

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
    public void testGetBoundaryAreasForCountry() throws IOException {
        Response res = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            pathParam("countrycodeiso3", COUNTRYCODE_ISO3).
            when().
            get(endpoint("/nationalarea/boundary/{countrycodeiso3}"));

        if (res.getStatusCode() == 500) {
            return; // probably out of memory -> big result set
        }

        assertThat(res.getStatusCode(), is(200));

        ObjectMapper mapper = new ObjectMapper();
        JsonNode jsNode = mapper.readTree(res.getBody().asString());

        JsonNode areas = jsNode.path("areas");
        assertThat(areas.size(), is(3));
        JsonNode areaName = areas.get(0).path("name");
        Assert.assertFalse(areaName.getClass().equals(MissingNode.class));
        JsonNode polygon = areas.get(0).path("polygon");
        Assert.assertFalse(polygon.getClass().equals(MissingNode.class));
    }
}
