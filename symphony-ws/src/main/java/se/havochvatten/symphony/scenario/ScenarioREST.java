package se.havochvatten.symphony.scenario;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.calculation.CalcService;
import se.havochvatten.symphony.dto.ScenarioDto;

import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.*;
import java.util.List;

/**
 * Calculation REST API
 * <p>
 * This class handles request decoding, result color-mapping and image encoding.
 */

@Path("/scenario")
@Api(value = "/scenario",
        produces = MediaType.APPLICATION_JSON,
        consumes = MediaType.APPLICATION_JSON)
public class ScenarioREST {
    private static final Logger logger = LoggerFactory.getLogger(ScenarioREST.class);

    @Inject
    ScenarioService service;

    @Inject
    CalcService calcService;

    @GET
    @ApiOperation(value = "List all scenarios belonging to logged in user")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public List<ScenarioDto> findAllByOwner(@Context HttpServletRequest req) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");
        else
            return service.findAllByOwner(req.getUserPrincipal());
    }

    @POST
    @ApiOperation(value = "Create new scenario", response = ScenarioDto.class)
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response createScenario(@Context HttpServletRequest req, @Context UriInfo uriInfo,
                                   ScenarioDto dto) {
        var persistedScenario = service.create(new Scenario(dto, calcService), req.getUserPrincipal());
        logger.info("Create {} (id={})", persistedScenario.getName(), persistedScenario.getId());
        var uri = uriInfo.getAbsolutePathBuilder().path(persistedScenario.getId().toString()).build();
        return Response.created(uri).entity(new ScenarioDto(persistedScenario)).build();
    }

    @PUT
    @ApiOperation(value = "Update scenario")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public ScenarioDto updateScenario(@Context HttpServletRequest req, ScenarioDto updated) throws NoContentException {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");

        var previous = service.findById(updated.id);
        if (previous == null)
            throw new NoContentException("Scenario to update does not exist");

        if (req.getUserPrincipal().getName().equals(previous.getOwner()))
            return new ScenarioDto(service.update(new Scenario(updated, calcService)));
        else
            throw new NotAuthorizedException("Not owner of scenario");
    }

    @DELETE
    @ApiOperation(value = "Delete scenario")
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response deleteScenario(@Context HttpServletRequest req, @PathParam("id") int id) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");

        service.delete(req.getUserPrincipal(), id);
        return Response.noContent().build();
    }
}
