package se.havochvatten.symphony.web;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.MissingNode;
import io.restassured.response.Response;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import se.havochvatten.symphony.dto.MetadataComponentDto;
import se.havochvatten.symphony.dto.UserLoginDto;

import java.io.IOException;

import static io.restassured.RestAssured.given;
import static org.junit.Assert.assertEquals;

public class MetaDataRESTTest extends RESTTest {
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
        assertEquals(200, response.getStatusCode());
    }

    @Test
    public void metadata_GET() throws IOException {
        String endpoint = endpoint("/metadata/{baselineName}");
        String baselineName = "BASELINE2019_CM";

        JsonNode res = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            pathParam("baselineName", baselineName).
            queryParam("lang", "sv").
            when().
            get(endpoint).
            then().
            extract().
            body().as(JsonNode.class);


        Assert.assertNotNull(res);
        Assert.assertFalse(res.isEmpty());

        JsonNode ecoComponent = res.path("ecoComponent");
        JsonNode pressureComponent = res.path("pressureComponent");
        Assert.assertNotEquals(ecoComponent.getClass(), MissingNode.class);
        Assert.assertNotEquals(pressureComponent.getClass(), MissingNode.class);

        JsonNode missingNode = res.path("donaldDuck");
        assertEquals(missingNode.getClass(), MissingNode.class);

        String pressureComponentJSON = res.path("pressureComponent").toString();
        String ecoComponentJSON = res.path("ecoComponent").toString();
        ObjectMapper mapper = new ObjectMapper();
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        MetadataComponentDto pressure = mapper.readValue(pressureComponentJSON, MetadataComponentDto.class);
        MetadataComponentDto eco = mapper.readValue(ecoComponentJSON, MetadataComponentDto.class);

        assertEquals("sv", res.path("language").asText());

        Assert.assertNotNull(pressure);
        Assert.assertNotNull(eco);
    }
}
