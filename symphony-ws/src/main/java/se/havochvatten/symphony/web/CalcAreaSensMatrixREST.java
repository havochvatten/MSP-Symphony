package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
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
@Api(value = "/calculationareasensmatrix",
        produces = MediaType.APPLICATION_JSON,
        consumes = MediaType.APPLICATION_JSON)
@Path("calculationareasensmatrix")
@RolesAllowed("GRP_SYMPHONY")
public class CalcAreaSensMatrixREST {
    @EJB
    CalcAreaSensMatrixService calcAreaSensMatrixService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get all relations between calculation areas and sensitivity matrices",
            response = CalcAreaSensMatrix.class, responseContainer = "List")
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
    @ApiOperation(value = "Get CalcAreaSensMatrix with id", response = CalcAreaSensMatrixDto.class)
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
    @ApiOperation(value = "Create relations between calculation areas and sensitivity matrices in " +
            "CalcAreaSensMatrix", response = CalcAreaSensMatrixDto.class)
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
    @ApiOperation(value = "Update CalcAreaSensMatrix", response = CalcAreaSensMatrixDto.class)
    public Response updateCalcAreaSensMatrix(@PathParam("id") Integer id,
                                             CalcAreaSensMatrixDto calcAreaSensMatrixDto) throws SymphonyStandardAppException {
        calcAreaSensMatrixDto.setId(id);
        CalcAreaSensMatrixDto calcAreaSensMatrixD = calcAreaSensMatrixService.update(calcAreaSensMatrixDto);
        return Response.ok(calcAreaSensMatrixD).build();
    }

    @DELETE
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Delete CalcAreaSensMatrix")
    public Response deleteCalcAreaSensMatrix(@PathParam("id") Integer id) throws SymphonyStandardAppException {
        calcAreaSensMatrixService.delete(id);
        return Response.ok().build();
    }

    @GET
    @ApiOperation(value = "List all user defined CalcAreaSensMatrices in the system for the baseline and " +
            "current user", response = CalcAreaSensMatrixDto.class, responseContainer = "List")
    @Produces({MediaType.APPLICATION_JSON})
    @Path("/user/{baselineName}")
    public List<CalcAreaSensMatrixDto> findByBaselineAndOwner(@Context HttpServletRequest req, @PathParam(
            "baselineName") String baselineName) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");

        return calcAreaSensMatrixService.findByBaselineAndOwner(baselineName, req.getUserPrincipal());
    }

    @GET
    @ApiOperation(value = "List all user defined CalcAreaSensMatrices in the system for the baseline, " +
            "current user and areaId", response = CalcAreaSensMatrixDto.class, responseContainer = "List")
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
