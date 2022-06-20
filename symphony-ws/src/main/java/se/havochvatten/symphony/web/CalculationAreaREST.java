package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import se.havochvatten.symphony.dto.CalculationAreaDto;
import se.havochvatten.symphony.entity.CalculationArea;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.mapper.CalculationAreaMapper;
import se.havochvatten.symphony.service.CalculationAreaService;

import javax.annotation.security.RolesAllowed;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@Stateless
@Api(value = "/calculationarea",
        produces = MediaType.APPLICATION_JSON,
        consumes = MediaType.APPLICATION_JSON)
@Path("calculationarea")
@RolesAllowed("GRP_SYMPHONY")
public class CalculationAreaREST {
    @EJB
    CalculationAreaService calculationAreaService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get all calculation areas for baselineName defined in the system", response =
            CalculationArea.class, responseContainer = "List")
    @Path("all/{baselineName}")
    public Response findCalculationAreas(@PathParam("baselineName") String baselineName) {
        List<CalculationArea> resp = calculationAreaService.findCalculationAreas(baselineName);
        if (resp != null) {
            return Response.ok(resp
                            .stream()
                            .map(CalculationAreaMapper::mapToDto)
                            .collect(Collectors.toUnmodifiableList()))
                    .build();
        } else
            return Response.noContent().build();
    }

    @GET
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get calculation area on id", response = CalculationArea.class,
            responseContainer = "List")
    public Response get(@PathParam("id") Integer id) throws SymphonyStandardAppException {
        CalculationAreaDto calculationAreaDto = calculationAreaService.get(id);
        return Response.ok(calculationAreaDto).build();
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Create a CalculationArea", response = Response.class)
    public Response create(@Context UriInfo uriInfo, CalculationAreaDto calculationAreaDto) throws SymphonyStandardAppException {
        calculationAreaDto = calculationAreaService.create(calculationAreaDto);
        URI uri = uriInfo.getAbsolutePathBuilder().path(String.valueOf(calculationAreaDto.getId())).build();
        return Response.created(uri).entity(calculationAreaDto).build();
    }

    @PUT
    @Path("{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Update CalculationArea", response = Response.class)
    public Response update(@PathParam("id") Integer id, CalculationAreaDto calculationAreaDto) throws SymphonyStandardAppException {
        calculationAreaDto.setId(id);
        calculationAreaDto = calculationAreaService.update(calculationAreaDto);
        return Response.ok(calculationAreaDto).build();
    }

    @DELETE
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Delete CalculationArea", response = Response.class)
    public Response deleteCalcAreaSensMatrix(@PathParam("id") Integer id) throws SymphonyStandardAppException {
        calculationAreaService.delete(id);
        return Response.ok().build();
    }
}
