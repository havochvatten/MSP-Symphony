package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import se.havochvatten.symphony.dto.CalcAreaSensMatrixDto;
import se.havochvatten.symphony.dto.FrontendErrorDto;
import se.havochvatten.symphony.dto.SensMatrixDto;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.service.CalcAreaSensMatrixService;
import se.havochvatten.symphony.service.PropertiesService;
import se.havochvatten.symphony.service.SensMatrixService;

import javax.annotation.security.RolesAllowed;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import java.net.URI;
import java.util.Date;
import java.util.List;

@Stateless
@Api(value = "/sensitivitymatrix",
        produces = MediaType.APPLICATION_JSON,
        consumes = MediaType.APPLICATION_JSON)
@Path("sensitivitymatrix")
@RolesAllowed("GRP_SYMPHONY")
public class SensMatrixREST {
    @EJB
    SensMatrixService sensMatrixService;

    @EJB
    CalcAreaSensMatrixService calcAreaSensMatrixService;

    @GET
    @ApiOperation(value = "List all sensitivity matrices in the system for the baseline (admin)")
    @Produces({MediaType.APPLICATION_JSON})
    @Path("{baselineName}")
    @RolesAllowed("GRP_SYMPHONY_ADMIN")
    public List<SensMatrixDto> findAll(@PathParam("baselineName") String baselineName,
                                       @DefaultValue("") @QueryParam("lang") String preferredLanguage) {
        return sensMatrixService.findSensMatrixDtos(baselineName, preferredLanguage);
    }

    @GET
    @ApiOperation(value = "List all user defined sensitivity matrices in the system for the baseline and " +
			"current user")
    @Produces({MediaType.APPLICATION_JSON})
    @Path("/user/{baselineName}")
    public List<SensMatrixDto> findByOwner(@Context HttpServletRequest req,
                                           @PathParam("baselineName") String baselineName,
                                           @DefaultValue("") @QueryParam("lang") String preferredLanguage) {
        return sensMatrixService.findSensMatrixDtosByOwner(baselineName, req.getUserPrincipal(), preferredLanguage);
    }

    @GET
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get user defined SensMatrixDto by id", response = SensMatrixDto.class)
    @Path("/id/{id}")
    public Response getSensMatrix(@PathParam("id") Integer id,
                                  @DefaultValue("") @QueryParam("lang") String preferredLanguage) {
        try {
            return Response.ok(sensMatrixService.getSensMatrixbyId(id, preferredLanguage)).build();
        } catch (SymphonyStandardAppException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(
                    new FrontendErrorDto(ex.getErrorCode().getErrorKey(),
							ex.getErrorCode().getErrorMessage())).build();
        }
    }

    @POST
    @ApiOperation(value = "Create user defined sensitivity matrix for current user", response =
			SensMatrixDto.class)
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{baselineName}")
    public Response createSensMatrix(@Context HttpServletRequest req, @Context UriInfo uriInfo, @PathParam(
			"baselineName") String baselineName, SensMatrixDto sensMatrixDto,
            @DefaultValue("") @QueryParam("lang") String preferredLanguage) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");

        try {
            sensMatrixDto = sensMatrixService.createSensMatrix(sensMatrixDto, baselineName, preferredLanguage,
					req.getUserPrincipal());
            URI uri = uriInfo.getAbsolutePathBuilder().path(String.valueOf(sensMatrixDto.getId())).build();
            return Response.created(uri).entity(sensMatrixDto).build();
        } catch (SymphonyStandardAppException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new FrontendErrorDto(ex.getErrorCode().getErrorKey(), ex.getErrorCode().getErrorMessage())).build();
        }
    }


    @PUT
    @Path("{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Update user defined sensitivity matrix for current user", response =
			SensMatrixDto.class)
    public Response updateSensMatrix(@Context HttpServletRequest req,
									 @PathParam("id") Integer id, SensMatrixDto sensMatrixDto,
                                     @DefaultValue("") @QueryParam("lang") String preferredLanguage) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");

        try {
            sensMatrixDto.setId(id);
			return Response.ok(sensMatrixService.updateSensMatrix(sensMatrixDto, preferredLanguage,
					req.getUserPrincipal())).build();
        } catch (SymphonyStandardAppException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new FrontendErrorDto(ex.getErrorCode().getErrorKey(), ex.getErrorCode().getErrorMessage())).build();
        }
    }

    @POST
    @ApiOperation(value = "Create user defined sensitivity matrix and connect to area in CalcAreaSensMatrix" +
			" for current user", response = SensMatrixDto.class)
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{baselineName}/{areaid}")
    public Response createSensMatrixForArea(@Context HttpServletRequest req, @Context UriInfo uriInfo,
											@PathParam("baselineName") String baselineName,
                                            @PathParam("areaid") int areaid,
                                            @DefaultValue("") @QueryParam("lang") String preferredLanguage,
											SensMatrixDto sensMatrixDto) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");

        try {
            sensMatrixDto = sensMatrixService.createSensMatrix(sensMatrixDto, baselineName, preferredLanguage,
					req.getUserPrincipal());
            CalcAreaSensMatrixDto calcAreaSensMatrixDto = new CalcAreaSensMatrixDto();
            calcAreaSensMatrixDto.setCalcareaId(areaid);
            calcAreaSensMatrixDto.setSensmatrixId(sensMatrixDto.getId());
            calcAreaSensMatrixDto.setComment(sensMatrixDto.getName() + "-" + (new Date()).getTime());
            calcAreaSensMatrixService.create(calcAreaSensMatrixDto);
            URI uri = uriInfo.getAbsolutePathBuilder().path(String.valueOf(sensMatrixDto.getId())).build();
            return Response.created(uri).entity(sensMatrixDto).build();
        } catch (SymphonyStandardAppException ex) {
            return Response.status(Response.Status.BAD_REQUEST)
					.entity(new FrontendErrorDto(ex.getErrorCode().getErrorKey(), ex.getErrorCode().getErrorMessage()))
					.build();
        }
    }

    @DELETE
    @ApiOperation(value = "Delete user defined Sensitivity matrix and all the relations in " +
			"CalcAreaSensMatrix for current user", response = Response.class)
    @Path("/withcalcareasens/{matrixid}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteSensMatrixAndCalcAreaSens(@Context HttpServletRequest req,
													@PathParam("matrixid") Integer matrixid) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");

        try {
            calcAreaSensMatrixService.deleteByAreaIdAndOwner(matrixid, req.getUserPrincipal());
            sensMatrixService.delete(matrixid, req.getUserPrincipal());
        } catch (SymphonyStandardAppException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new FrontendErrorDto(ex.getErrorCode().getErrorKey(), ex.getErrorCode().getErrorMessage())).build();
        }
        return Response.ok().build();
    }

    @DELETE
    @ApiOperation(value = "Delete user defined Sensitivity matrix and all the relations in " +
			"CalcAreaSensMatrix for current user", response = Response.class)
    @Path("/{matrixid}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteSensMatrix(@Context HttpServletRequest req,
									 @PathParam("matrixid") Integer matrixid) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");

        try {
            sensMatrixService.delete(matrixid, req.getUserPrincipal());
        } catch (SymphonyStandardAppException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new FrontendErrorDto(ex.getErrorCode().getErrorKey(), ex.getErrorCode().getErrorMessage())).build();
        }
        return Response.ok().build();
    }

}
