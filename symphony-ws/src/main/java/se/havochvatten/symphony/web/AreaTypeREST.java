package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import se.havochvatten.symphony.dto.AreaTypeDto;
import se.havochvatten.symphony.dto.FrontendErrorDto;
import se.havochvatten.symphony.entity.AreaType;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.service.AreaTypeService;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Stateless
@Api(value = "/areatype", produces = MediaType.APPLICATION_JSON, consumes = MediaType.APPLICATION_JSON)
@Path("areatype")
@RolesAllowed("GRP_SYMPHONY")
public class AreaTypeREST {
    @EJB
    AreaTypeService areaTypeService;

    @GET
    @ApiOperation(value = "List all area types in the system", response = AreaType.class,
			responseContainer = "List")
    @Produces({MediaType.APPLICATION_JSON})
    @RolesAllowed("GRP_SYMPHONY")
    public Response findAll() {
        List<AreaTypeDto> dto = new ArrayList<>();
        List<AreaType> areaType = areaTypeService.findAll();
        if (areaType != null) {
            areaType.forEach(at -> dto.add(new AreaTypeDto(at)));
        }
        return Response.ok(dto).build();
    }

    @POST
    @ApiOperation(value = "Create area type", response = AreaType.class)
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY_ADMIN")
    public Response createAreaType(@Context UriInfo uriInfo, AreaType areaType) {
        try {
            areaType = areaTypeService.createAreaType(areaType);
            URI uri = uriInfo.getAbsolutePathBuilder().path(String.valueOf(areaType.getId())).build();
            return Response.created(uri).entity(areaType).build();
        } catch (SymphonyStandardAppException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new FrontendErrorDto(ex.getErrorCode().getErrorKey(), ex.getErrorCode().getErrorMessage())).build();
        }
    }

    @PUT
    @Path("{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Update AreaType", response = AreaType.class)
    @RolesAllowed("GRP_SYMPHONY_ADMIN")
    public Response updateCalcAreaSensMatrix(@PathParam("id") Integer id, AreaType areaType) {
        try {
            areaType.setId(id);
            AreaType atypeUpd = areaTypeService.updateAreaType(areaType);
            return Response.ok(atypeUpd).build();
        } catch (SymphonyStandardAppException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new FrontendErrorDto(ex.getErrorCode().getErrorKey(), ex.getErrorCode().getErrorMessage())).build();
        }
    }

    @DELETE
    @ApiOperation(value = "Delete area type")
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY_ADMIN")
    public Response deleteAreaType(@PathParam("id") Integer id) {
        try {
            areaTypeService.delete(id);
        } catch (SymphonyStandardAppException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new FrontendErrorDto(ex.getErrorCode().getErrorKey(), ex.getErrorCode().getErrorMessage())).build();
        }
        return Response.ok().build();
    }
}
