package se.havochvatten.symphony.web;

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
        String baselineName = "BASELINE2019";

        JsonNode res = given().
            auth().
            preemptive().
            basic(getUsername(), getPassword()).
            pathParam("baselineName", baselineName).
            when().
            get(endpoint).
            then().
            extract().
            body().as(JsonNode.class);


        Assert.assertNotNull(res);
        Assert.assertTrue(res.size() > 0);

        JsonNode ecoComponent = res.path("ecoComponent");
        JsonNode pressureComponent = res.path("pressureComponent");
        Assert.assertFalse(ecoComponent.getClass().equals(MissingNode.class));
        Assert.assertFalse(pressureComponent.getClass().equals(MissingNode.class));

        JsonNode missingNode = res.path("donaldDuck");
        Assert.assertTrue(missingNode.getClass().equals(MissingNode.class));

        String pressureComponentJSON = res.path("pressureComponent").toString();
        String ecoComponentJSON = res.path("ecoComponent").toString();
        ObjectMapper mapper = new ObjectMapper();
        MetadataComponentDto pressure = mapper.readValue(pressureComponentJSON, MetadataComponentDto.class);
        MetadataComponentDto eco = mapper.readValue(ecoComponentJSON, MetadataComponentDto.class);

        assertEquals("sv", res.path("language").asText());

        Assert.assertNotNull(pressure);
        Assert.assertNotNull(eco);
    }
}
