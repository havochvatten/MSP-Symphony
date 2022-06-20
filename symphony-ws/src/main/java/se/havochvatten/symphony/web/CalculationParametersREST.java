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
        consumes = MediaType.APPLICATION_JSON)
@Path("calculationparams")
public class CalculationParametersREST {
    @EJB
    CalculationAreaService calculationAreaService;

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get selection of possible matrices for a polygon", response =
            AreaSelectionResponseDto.class,
            responseContainer = "List")
    @Path("areamatrices/{baselineName}")
    @RolesAllowed("GRP_SYMPHONY")
    public Response getAreaMatrices(@Context HttpServletRequest req,
									@PathParam("baselineName") String baselineName,
                                    Object polygon)
			throws SymphonyStandardAppException {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");
        try {
            return Response.ok(calculationAreaService.areaSelect(baselineName, polygon, req.getUserPrincipal()))
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
