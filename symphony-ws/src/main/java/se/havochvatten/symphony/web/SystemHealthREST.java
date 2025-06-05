package se.havochvatten.symphony.web;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ejb.Stateless;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Stateless
@Tag(name ="/ping")
@Path("ping")
public class SystemHealthREST {
    /**
     * Dummy endpoint to check if the system is up and running
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response ping() {
        return Response.ok("PONG").build();
    }
}
