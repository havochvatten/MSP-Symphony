package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;

import javax.ejb.Stateless;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Stateless
@Api(value = "/ping", produces = MediaType.APPLICATION_JSON, consumes = MediaType.APPLICATION_JSON)
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
