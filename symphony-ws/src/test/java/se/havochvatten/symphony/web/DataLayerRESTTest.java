package se.havochvatten.symphony.web;

import com.fasterxml.jackson.databind.JsonNode;
import io.restassured.response.Response;
import org.hamcrest.Matchers;
import org.junit.Assert;
import org.junit.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class DataLayerRESTTest extends RESTTest {

    @Test
    public void testGetDataLayer() {
        String endpoint = endpoint("/datalayer/{type}/{id}/{baselineName}");

        given().
                pathParam("type", "ecosystem").
                pathParam("id", "28").
                pathParam("baselineName", "BASELINE2019").
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                get(endpoint).
                then().
                header("SYM-Image-Extent", Matchers.startsWith("[")). // When header is in metadata..
                contentType("image/png").
                statusCode(200);
    }

    @Test
    public void testGetDataLayerRunTwiceToEnsureExisting_png_also_has_metadata() {
        String endpoint = endpoint("/datalayer/{type}/{id}/{baselineName}");

        final var id = "5";

        Response response = given().
                pathParam("type", "ecosystem").
                pathParam("id", id).
                pathParam("baselineName", "BASELINE2019").
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                get(endpoint);

        int status = response.getStatusCode();
        String extent = response.getHeader("SYM-Image-Extent");
        String contentType = response.getContentType();
        Assert.assertEquals(200, status);
        Assert.assertEquals("image/png", contentType);
        Assert.assertTrue(extent.startsWith("["));

        Response response2 = given().
                pathParam("type", "ecosystem").
                pathParam("id", id).
                pathParam("baselineName", "BASELINE2019").
                auth().
                preemptive().
                basic(getUsername(), getPassword()).
                when().
                get(endpoint);

        int status2 = response2.getStatusCode();
        String extent2 = response2.getHeader("SYM-Image-Extent");
        String contentType2 = response2.getContentType();
        Assert.assertEquals(200, status2);
        Assert.assertTrue(extent2.startsWith("["));
        Assert.assertEquals("image/png", contentType2);
        Assert.assertEquals(extent, extent2);
    }

    @Test
    public void testGetSummaryModelImage_simple() {
        for (String type : new String[]{"ecosystem", "pressure"}) {
            given()
                .pathParam("baselineName", "BASELINE2019")
                .pathParam("type", type)
                .pathParam("model", "simple")
                .auth().preemptive().basic(getUsername(), getPassword())
                .when()
                .get(endpoint("/datalayer/{baselineName}/{type}/model/{model}"))
                .then()
                .statusCode(200)
                .contentType("image/png")
                .header("SYM-Image-Extent", startsWith("["));
        }
    }

    @Test
    public void testGetSummaryModelImage_balanced() {
        for (String type : new String[]{"ecosystem", "pressure"}) {
            given()
                .pathParam("baselineName", "BASELINE2019")
                .pathParam("type", type)
                .pathParam("model", "balanced")
                .auth().preemptive().basic(getUsername(), getPassword())
                .when()
                .get(endpoint("/datalayer/{baselineName}/{type}/model/{model}"))
                .then()
                .statusCode(200)
                .contentType("image/png")
                .header("SYM-Image-Extent", startsWith("["));
        }
    }

    @Test
    public void testGetSummaryModelImage_cachedResponseHasSameExtent() {
        String ep = endpoint("/datalayer/{baselineName}/{type}/model/{model}");

        Response first = given()
            .pathParam("baselineName", "BASELINE2019")
            .pathParam("type", "ecosystem")
            .pathParam("model", "simple")
            .auth().preemptive().basic(getUsername(), getPassword())
            .when().get(ep);

        Response second = given()
            .pathParam("baselineName", "BASELINE2019")
            .pathParam("type", "ecosystem")
            .pathParam("model", "simple")
            .auth().preemptive().basic(getUsername(), getPassword())
            .when().get(ep);

        Assert.assertEquals(200, first.getStatusCode());
        Assert.assertEquals(200, second.getStatusCode());
        Assert.assertEquals(first.getHeader("SYM-Image-Extent"), second.getHeader("SYM-Image-Extent"));
    }

    @Test
    public void testGetAvailableSummaryModels() {
        given()
            .pathParam("baselineName", "BASELINE2019")
            .pathParam("type", "ecosystem")
            .auth().preemptive().basic(getUsername(), getPassword())
            .when()
            .get(endpoint("/datalayer/{baselineName}/{type}/models"))
            .then()
            .statusCode(200)
            .contentType(containsString("application/json"))
            .body("$", hasItems("simple", "balanced"));
    }

    @Test
    public void testGetModelDescription_returnsValidStructure() {
        JsonNode desc = given()
            .pathParam("baselineName", "BASELINE2019")
            .pathParam("type", "ecosystem")
            .pathParam("model", "simple")
            .queryParam("locale", "en")
            .auth().preemptive().basic(getUsername(), getPassword())
            .when()
            .get(endpoint("/datalayer/{baselineName}/{type}/model/{model}/description"))
            .then()
            .statusCode(200)
            .contentType(containsString("application/json"))
            .extract().body().as(JsonNode.class);

        Assert.assertNotNull(desc.get("modelKey"));
        Assert.assertNotNull(desc.get("titleTranslationKey"));
        Assert.assertNotNull(desc.get("steps"));
        Assert.assertTrue(desc.get("steps").isArray());
        Assert.assertFalse(desc.get("steps").isEmpty());

        // At least one step should have non-empty formulaInputs with a displayName
        boolean anyHasDisplayName = false;
        for (JsonNode step : desc.get("steps")) {
            JsonNode inputs = step.get("formulaInputs");
            if (inputs != null && inputs.isArray()) {
                for (JsonNode input : inputs) {
                    if (!input.path("displayName").asText().isEmpty()) {
                        anyHasDisplayName = true;
                    }
                }
            }
        }
        Assert.assertTrue("Expected at least one step with a non-empty formulaInputs displayName", anyHasDisplayName);

        // The configured outputStep should have isOutput=true
        boolean hasOutputStep = false;
        for (JsonNode step : desc.get("steps")) {
            if (step.path("output").asBoolean()) {
                hasOutputStep = true;
            }
        }
        Assert.assertTrue("Expected exactly one output step with isOutput=true", hasOutputStep);
    }

    @Test
    public void testGetSummaryModel_unknownModel_returnsErrorStatus() {
        // Documents current behavior: unknown model key results in a server error (500 or 400).
        // If this is later changed to 404 via a proper WebApplicationException, update accordingly.
        int status = given()
            .pathParam("baselineName", "BASELINE2019")
            .pathParam("type", "ecosystem")
            .pathParam("model", "nonexistent_model_xyz")
            .auth().preemptive().basic(getUsername(), getPassword())
            .when()
            .get(endpoint("/datalayer/{baselineName}/{type}/model/{model}"))
            .getStatusCode();

        Assert.assertTrue("Expected 4xx or 5xx for unknown model, got " + status, status >= 400);
    }
}
