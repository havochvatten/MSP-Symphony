package se.havochvatten.symphony.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.entity.Scenario;
import se.havochvatten.symphony.entity.ScenarioArea;
import se.havochvatten.symphony.scenario.ChangesSelection;
import se.havochvatten.symphony.scenario.ScenarioCopyOptions;
import se.havochvatten.symphony.scenario.ScenarioSplitOptions;
import se.havochvatten.symphony.service.CalcService;
import se.havochvatten.symphony.dto.ScenarioAreaDto;
import se.havochvatten.symphony.dto.ScenarioDto;
import se.havochvatten.symphony.entity.CalculationResult;
import se.havochvatten.symphony.service.ScenarioService;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import java.security.Principal;
import java.util.List;
import java.util.Optional;

import static se.havochvatten.symphony.web.WebUtil.noPrincipalStr;

/**
 * Scenario REST API
 */

@Path("/scenario")
@Tag(name ="/scenario")
public class ScenarioREST {
    private static final Logger logger = LoggerFactory.getLogger(ScenarioREST.class);

    // should utilize error mapping instead of messages defined locally
    private static final String notFoundMessage = "Scenario not found";
    private static final String areaNotFoundMessage = "Scenario area not found";
    private static final String notAuthorizedMessage = "Not owner of scenario";

    @Inject
    ScenarioService service;

    @Inject
    CalcService calcService;

    static void checkAndAuthorizeScenarioOwner(HttpServletRequest req, Scenario scenario) throws NotAuthorizedException {
        if(scenario == null)
            throw new NotFoundException(notFoundMessage);

        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException(noPrincipalStr);

        if (!req.getUserPrincipal().getName().equals(scenario.getOwner()))
            throw new NotAuthorizedException(notAuthorizedMessage);
    }

    @GET
    @Operation(summary = "List all scenarios belonging to logged in user")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public List<ScenarioDto> findAllByOwner(@Context HttpServletRequest req) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException(noPrincipalStr);
        else
            return service.findAllByOwner(req.getUserPrincipal());
    }

    @POST
    @Operation(summary = "Create new scenario")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response createScenario(@Context HttpServletRequest req, @Context UriInfo uriInfo,
                                   ScenarioDto dto) {
        var persistedScenario = service.create(new Scenario(dto, service), req.getUserPrincipal());
        logger.info("Create {} (id={})", persistedScenario.getName(), persistedScenario.getId());
        var uri = uriInfo.getAbsolutePathBuilder().path(persistedScenario.getId().toString()).build();
        return Response.created(uri).entity(new ScenarioDto(persistedScenario)).build();
    }

    @PUT
    @Operation(summary = "Update scenario")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public ScenarioDto updateScenario(@Context HttpServletRequest req, ScenarioDto updated) throws NoContentException {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException(noPrincipalStr);

        var previous = service.findById(updated.id);
        if (previous == null)
            throw new NoContentException("Scenario to update does not exist");

        if (req.getUserPrincipal().getName().equals(previous.getOwner())) {
            Scenario scenarioToSave = new Scenario(updated, service);
            if(updated.latestCalculationId != null) {
                CalculationResult calc = Optional.ofNullable(calcService.getCalculation(updated.latestCalculationId)).orElseThrow(NotFoundException::new);
                scenarioToSave.setLatestCalculation(calc);
            }

            return new ScenarioDto(service.update(scenarioToSave));
        } else throw new NotAuthorizedException(notAuthorizedMessage);
    }

    @GET
    @Operation(summary = "Get scenario by id")
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public ScenarioDto findById(@Context HttpServletRequest req, @PathParam("id") int id) {
        Scenario scenario = service.findById(id);
        checkAndAuthorizeScenarioOwner(req, scenario);
        return new ScenarioDto(scenario);
    }

    // Unused endpoint at the moment.
    // Might be useful for future functionality.
    @PUT
    @Operation(summary = "Update scenario area")
    @Path("/area")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public ScenarioAreaDto updateScenarioArea(@Context HttpServletRequest req, ScenarioAreaDto updated) throws NoContentException {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException(noPrincipalStr);

        var previous = service.findAreaById(updated.id);
        if (previous == null)
            throw new NoContentException("Scenario area to update does not exist");

        Scenario scenario = service.findById(updated.getScenarioId());

        if (req.getUserPrincipal().getName().equals(scenario.getOwner()))
            return new ScenarioAreaDto(service.updateArea(new ScenarioArea(updated, scenario), updated.getCustomCalcAreaId()), scenario.getId());
        else
            throw new NotAuthorizedException("Not owner of scenario area");
    }

    // POST verb preferred over COPY for creating a new scenario from an existing since the
    // endpoint accepts option parameters for the procedure. It's reasonably not considered a
    // pure copying operation, but rather a convenience method facilitating scenario creation
    // (typically utilized for making comparison analyses)
    @POST
    @Operation(summary = "Copy scenario")
    @Path("{id}/copy")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response copyScenario(@Context HttpServletRequest req, @PathParam("id") int scenarioId,
                                          ScenarioCopyOptions options) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException(noPrincipalStr);

        Scenario scenario = service.findById(scenarioId);

        if (req.getUserPrincipal().getName().equals(scenario.getOwner())) {
            var persistedScenario = service.copy(scenario, options);
            return Response.ok(persistedScenario).build();
        }
        else
            throw new NotAuthorizedException(notAuthorizedMessage);
    }

    @POST
    @Operation(summary = "Split and replace area within scenario")
    @Path("{id}/splitAndReplaceArea/{areaId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response splitAndReplaceArea(@Context HttpServletRequest req,
        @PathParam("id") int scenarioId, @PathParam("areaId") int scenarioAreaId, ScenarioAreaDto[] replacementAreas) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException(noPrincipalStr);

        Scenario scenario = service.findById(scenarioId);

        if (req.getUserPrincipal().getName().equals(scenario.getOwner())) {
            var updatedScenario = service.splitAndReplaceArea(scenario, scenarioAreaId, replacementAreas);
            return Response.ok(new ScenarioDto(updatedScenario)).build();
        }
        else
            throw new NotAuthorizedException(notAuthorizedMessage);

    }

    // Added for conformant/intuitive API semantics.
    // Not presently used by the default UI app (/symphony-fe).
    @DELETE
    @Path("{id}")
    @Operation(summary = "Delete scenario by id")
    @Produces
    @RolesAllowed("GRP_SYMPHONY")
    public Response deleteScenario(@Context HttpServletRequest req, @PathParam("id") int scenarioId) {
        return deleteScenarios(req, String.valueOf(scenarioId));
    }

    @DELETE
    @Operation(summary = "Delete scenarios by ids, expected as comma separated query parameter")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response deleteScenarios(@Context HttpServletRequest req, @QueryParam("ids") String ids){
        Principal principal = req.getUserPrincipal();

        if (principal == null)
            throw new NotAuthorizedException(noPrincipalStr);

        int[] idArray = WebUtil.intArrayParam(ids);

        try {
            for (int scenarioId : idArray) {
                service.delete(principal, scenarioId);
            }
            return Response.noContent().build();
        } catch (NotFoundException nx) {
            return Response.status(Response.Status.NOT_FOUND).build();
        } catch (ForbiddenException ax) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }
    }

    @DELETE
    @Operation(summary = "Delete a scenario area")
    @Path("/area/{areaId}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response deleteScenarioArea(@Context HttpServletRequest req, @PathParam("areaId") int areaId) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException(noPrincipalStr);

        service.deleteArea(req.getUserPrincipal(), areaId);
        return Response.noContent().build();
    }

    @POST
    @Path("{id}/areas")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response addScenarioAreas(@Context HttpServletRequest req,
                                       @PathParam("id") int scenarioId,
                                       ScenarioAreaDto[] areaDtos) throws JsonProcessingException {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException(noPrincipalStr);

        Scenario scenario = service.findById(scenarioId);
        if (scenario == null)
            throw new NotFoundException(notFoundMessage);

        if (!req.getUserPrincipal().getName().equals(scenario.getOwner()))
            throw new NotAuthorizedException(notAuthorizedMessage);

        var persistedAreas = service.addAreas(scenario, areaDtos);
        return Response.created(null).entity(persistedAreas).build();
    }

    @POST
    @Path("{id}/transferChanges")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response transferChanges(@Context HttpServletRequest req, @PathParam("id") int scenarioId,
                                    ChangesSelection changesSelection) {
        var principal = req.getUserPrincipal().getName();

        if (principal == null)
            throw new NotAuthorizedException(noPrincipalStr);

        Scenario scenario = service.findById(scenarioId);
        Scenario sourceScenario = service.findById(changesSelection.Id());

        if (scenario == null || sourceScenario == null)
            throw new NotFoundException(notFoundMessage);

        if (!(principal.equals(scenario.getOwner()) && principal.equals(sourceScenario.getOwner())))
            throw new NotAuthorizedException(notAuthorizedMessage);

        var persistedScenario = service.transferChanges(scenario, sourceScenario, changesSelection.overwrite());

        return Response.ok(new ScenarioDto(persistedScenario)).build();
    }

    @POST
    @Path("{id}/transferAreaChanges")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response transferAreaChanges(@Context HttpServletRequest req, @PathParam("id") int scenarioId,
                                    ChangesSelection changesSelection) {
        var principal = req.getUserPrincipal().getName();

        if (principal == null)
            throw new NotAuthorizedException(noPrincipalStr);

        Scenario scenario = service.findById(scenarioId);
        ScenarioArea sourceArea = service.findAreaById(changesSelection.Id());

        if (scenario == null)
            throw new NotFoundException(notFoundMessage);

        if (sourceArea == null)
            throw new NotFoundException(areaNotFoundMessage);

        if (!(principal.equals(scenario.getOwner()) && principal.equals(sourceArea.getScenario().getOwner())))
            throw new NotAuthorizedException(notAuthorizedMessage);

        var persistedScenario = service.transferChanges(scenario, sourceArea, changesSelection.overwrite());

        return Response.ok(new ScenarioDto(persistedScenario)).build();
    }

    record ScenarioSplitResponse(int scenarioId, int[] splitScenarioIds) {}

    @POST
    @Operation(summary = "Split scenario by its areas")
    @Path("{id}/split")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response splitScenario(@Context HttpServletRequest req, @PathParam("id") int scenarioId, ScenarioSplitOptions options) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException(noPrincipalStr);

        Scenario scenario = service.findById(scenarioId);
        if (scenario == null)
            throw new NotFoundException(notFoundMessage);

        if (!req.getUserPrincipal().getName().equals(scenario.getOwner()))
            throw new NotAuthorizedException(notAuthorizedMessage);

        int[] splitScenarioIds = service.split(scenario, options);

        ScenarioSplitResponse response =
            new ScenarioSplitResponse(scenarioId,
                                      options.batchSelect() ? splitScenarioIds : new int[0]);

        return Response.ok(response).build();
    }


    @POST
    @Path("area/{areaId}/transferChanges")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response transferChanges_Area(@Context HttpServletRequest req, @PathParam("areaId") int areaId,
                                    ChangesSelection changesSelection) {
        var principal = req.getUserPrincipal().getName();

        if (principal == null)
            throw new NotAuthorizedException(noPrincipalStr);

        ScenarioArea area = service.findAreaById(areaId);
        Scenario sourceScenario = service.findById(changesSelection.Id());

        if(area == null)
            throw new NotFoundException(areaNotFoundMessage);

        if (sourceScenario == null)
            throw new NotFoundException(notFoundMessage);

        if (!(principal.equals(area.getScenario().getOwner()) && principal.equals(sourceScenario.getOwner())))
            throw new NotAuthorizedException(notAuthorizedMessage);

        var persistedScenario = service.transferChanges(area, sourceScenario, changesSelection.overwrite());

        return Response.ok(new ScenarioDto(persistedScenario)).build();
    }

    @POST
    @Path("area/{areaId}/transferAreaChanges")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response transferAreaChanges_Area(@Context HttpServletRequest req, @PathParam("areaId") int areaId,
                                    ChangesSelection changesSelection) {
        var principal = req.getUserPrincipal().getName();

        if (principal == null)
            throw new NotAuthorizedException(noPrincipalStr);

        ScenarioArea area = service.findAreaById(areaId);
        ScenarioArea sourceArea = service.findAreaById(changesSelection.Id());

        if(area == null || sourceArea == null)
            throw new NotFoundException(areaNotFoundMessage);

        if (!(principal.equals(area.getScenario().getOwner()) && principal.equals(sourceArea.getScenario().getOwner())))
            throw new NotAuthorizedException(notAuthorizedMessage);

        var persistedScenario = service.transferChanges(area, sourceArea, changesSelection.overwrite());

        return Response.ok(new ScenarioDto(persistedScenario)).build();
    }

}
