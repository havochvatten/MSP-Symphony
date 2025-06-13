package se.havochvatten.symphony.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import se.havochvatten.symphony.dto.CalcAreaSensMatrixDto;
import se.havochvatten.symphony.dto.FrontendErrorDto;
import se.havochvatten.symphony.entity.CalcAreaSensMatrix;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.mapper.CalcAreaSensMatrixMapper;
import se.havochvatten.symphony.service.CalcAreaSensMatrixService;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;


@Stateless
@Tag(name = "/calculationareasensmatrix")
@Path("calculationareasensmatrix")
@RolesAllowed("GRP_SYMPHONY")
public class CalcAreaSensMatrixREST {
    @EJB
    CalcAreaSensMatrixService calcAreaSensMatrixService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get all relations between calculation areas and sensitivity matrices")
    public Response findAllCalcAreaSensMatrices() {
        List<CalcAreaSensMatrixDto> ret = new ArrayList<>();
        List<CalcAreaSensMatrix> resp = calcAreaSensMatrixService.find();
        if (resp != null) {
            resp.forEach(casm -> ret.add(new CalcAreaSensMatrixDto(casm)));
        }
        return Response.ok(ret).build();
    }

    @GET
    @Path("{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get CalcAreaSensMatrix with id")
    public Response getCalcAreaSensMatrix(@PathParam("id") Integer id) {
        try {
            CalcAreaSensMatrixDto calcAreaSensMatrixD = calcAreaSensMatrixService.get(id);
            return Response.ok(calcAreaSensMatrixD).build();
        } catch (SymphonyStandardAppException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(
                    new FrontendErrorDto(ex.getErrorCode().getErrorKey(), ex.getErrorCode().getErrorMessage())).build();
        }
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Create relations between calculation areas and sensitivity matrices in " +
            "CalcAreaSensMatrix")
    public Response createCalcAreaSensMatrice(@Context UriInfo uriInfo,
                                              CalcAreaSensMatrixDto calcAreaSensMatrixDto) {
        CalcAreaSensMatrixDto calcAreaSensMatrix = calcAreaSensMatrixService.create(calcAreaSensMatrixDto);
        URI uri = uriInfo.getAbsolutePathBuilder().path(String.valueOf(calcAreaSensMatrix.getId())).build();
        return Response.created(uri).entity(calcAreaSensMatrix).build();
    }

    @PUT
    @Path("{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Update CalcAreaSensMatrix")
    public Response updateCalcAreaSensMatrix(@PathParam("id") Integer id,
                                             CalcAreaSensMatrixDto calcAreaSensMatrixDto) throws SymphonyStandardAppException {
        calcAreaSensMatrixDto.setId(id);
        CalcAreaSensMatrixDto calcAreaSensMatrixD = calcAreaSensMatrixService.update(calcAreaSensMatrixDto);
        return Response.ok(calcAreaSensMatrixD).build();
    }

    @DELETE
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Delete CalcAreaSensMatrix")
    public Response deleteCalcAreaSensMatrix(@PathParam("id") Integer id) throws SymphonyStandardAppException {
        calcAreaSensMatrixService.delete(id);
        return Response.ok().build();
    }

    @GET
    @Operation(summary = "List all user defined CalcAreaSensMatrices in the system for the baseline and " +
            "current user")
    @Produces({MediaType.APPLICATION_JSON})
    @Path("/user/{baselineName}")
    public List<CalcAreaSensMatrixDto> findByBaselineAndOwner(@Context HttpServletRequest req, @PathParam(
            "baselineName") String baselineName) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");

        return calcAreaSensMatrixService.findByBaselineAndOwner(baselineName, req.getUserPrincipal());
    }

    @GET
    @Operation(summary = "List all user defined CalcAreaSensMatrices in the system for the baseline, " +
            "current user and areaId")
    @Produces({MediaType.APPLICATION_JSON})
    @Path("/user/{baselineName}/{areaId}")
    public List<CalcAreaSensMatrixDto> findByBaselineAndOwnerAndAreaId(@Context HttpServletRequest req,
                                                                       @PathParam("baselineName") String baselineName,
                                                                       @PathParam("areaId") int areaId) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");

        return CalcAreaSensMatrixMapper.mapToDtos(calcAreaSensMatrixService.findByBaselineAndOwnerAndArea(
                baselineName, req.getUserPrincipal(), areaId));
    }
}
