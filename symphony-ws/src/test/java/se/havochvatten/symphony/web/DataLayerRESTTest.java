package se.havochvatten.symphony.web;

import io.restassured.response.Response;
import org.hamcrest.Matchers;
import org.junit.Assert;
import org.junit.Test;

import static io.restassured.RestAssured.given;

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
}
