package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import se.havochvatten.symphony.dto.AreaSelectionResponseDto;
import se.havochvatten.symphony.dto.FrontendErrorDto;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.service.CalculationAreaService;

import javax.annotation.security.RolesAllowed;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Stateless
// TODO Move to se/havochvatten/symphony/web/CalcAreaSensMatrixREST.java?
@Api(value = "/calculationparams",
        produces = MediaType.APPLICATION_JSON,
        consumes = MediaType.TEXT_PLAIN)
@Path("calculationparams")
public class CalculationParametersREST {
    @EJB
    CalculationAreaService calculationAreaService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get a selection of possible matrices for a given scenario area",
        response = AreaSelectionResponseDto.class,
        responseContainer = "Object")
    @Path("areamatrix/{baselineName}/{areaId}")
    @RolesAllowed("GRP_SYMPHONY")
    public Response getAreaMatrix(@Context HttpServletRequest req,
                                  @PathParam("baselineName") String baselineName,
                                  @PathParam("areaId") int areaId) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");
        try {
            return Response.ok(calculationAreaService.areaSelect(baselineName, areaId, req.getUserPrincipal()))
                    .build();
        } catch (SymphonyStandardAppException ex) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new FrontendErrorDto(ex.getErrorCode().getErrorKey(), ex.getErrorCode().getErrorMessage()))
                    .build();
        } catch (Exception ex) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new FrontendErrorDto("Exception thrown", "Unable to find area matrix"))
                    .build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get a list of possible matrices for each area within a given scenario",
        response = AreaSelectionResponseDto.class,
        responseContainer = "List")
    @Path("areamatrices/{baselineName}/{scenarioId}")
    @RolesAllowed("GRP_SYMPHONY")
    public Response getAreaMatrices(@Context HttpServletRequest req,
									@PathParam("baselineName") String baselineName,
                                    @PathParam("scenarioId") int scenarioId) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");
        try {
            return Response.ok(calculationAreaService.scenarioAreaSelect(baselineName, scenarioId, req.getUserPrincipal()))
                    .build();
        } catch (SymphonyStandardAppException ex) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new FrontendErrorDto(ex.getErrorCode().getErrorKey(), ex.getErrorCode().getErrorMessage()))
                    .build();
        } catch (Exception ex) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new FrontendErrorDto("Exception thrown", "Unable to find area matrices"))
                    .build();
        }
    }
}
