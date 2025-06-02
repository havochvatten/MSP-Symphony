package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import se.havochvatten.symphony.dto.AreaSelectionResponseDto;
import se.havochvatten.symphony.dto.FrontendErrorDto;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.service.CalculationAreaService;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

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
        } catch (Exception ex) {
            return areaMatrixErrorResponse(ex);
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
        } catch (Exception ex) {
            return areaMatrixErrorResponse(ex);
        }
    }

    private static Response areaMatrixErrorResponse(Exception ex) {
        if (ex instanceof SymphonyStandardAppException ssx) {
            if (ssx.getErrorCode() == SymphonyModelErrorCode.NO_DEFAULT_MATRIX_FOUND) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(new FrontendErrorDto(ssx.getErrorCode().getErrorKey(), ssx.getErrorCode().getErrorMessage()))
                    .build();
            }
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new FrontendErrorDto(ssx.getErrorCode().getErrorKey(), ssx.getErrorCode().getErrorMessage()))
                .build();
        } else {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new FrontendErrorDto("Exception thrown", "Error querying area matrices"))
                .build();
        }
    }
}
