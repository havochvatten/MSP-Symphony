package se.havochvatten.symphony.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import se.havochvatten.symphony.dto.CalculationAreaDto;
import se.havochvatten.symphony.entity.CalculationArea;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.mapper.CalculationAreaMapper;
import se.havochvatten.symphony.service.CalculationAreaService;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import java.net.URI;
import java.util.List;

@Stateless
@Tag(name = "/calculationarea")
@Path("calculationarea")
@RolesAllowed("GRP_SYMPHONY")
public class CalculationAreaREST {
    @EJB
    CalculationAreaService calculationAreaService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get all calculation areas for baselineName defined in the system")
    @Path("all/{baselineName}")
    public Response findCalculationAreas(@PathParam("baselineName") String baselineName) {
        List<CalculationArea> resp = calculationAreaService.findCalculationAreas(baselineName);
        if (resp != null) {
            return Response.ok(resp
                            .stream()
                            .map(CalculationAreaMapper::mapToDto)
                            .toList())
                    .build();
        } else
            return Response.noContent().build();
    }

    @GET
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get calculation area on id")
    public Response get(@PathParam("id") Integer id) throws SymphonyStandardAppException {
        CalculationAreaDto calculationAreaDto = calculationAreaService.get(id);
        return Response.ok(calculationAreaDto).build();
    }

    @GET
    @Path("calibrated/{baselineName}")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get all calculation areas for baselineName defined in the system " +
                          "for which a max value has been set")
    public Response findCalibratedCalculationAreas(@PathParam("baselineName") String baselineName) {
        List<CalculationArea> resp = calculationAreaService.findCalibratedCalculationAreas(baselineName);

        if (resp != null) {
            return Response.ok(resp
                            .stream()
                            .map(CalculationAreaMapper::mapToSparseDto)
                            .toList())
                    .build();
        } else
            return Response.noContent().build();
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Create a CalculationArea")
    public Response create(@Context UriInfo uriInfo, CalculationAreaDto calculationAreaDto) throws SymphonyStandardAppException {
        calculationAreaDto = calculationAreaService.create(calculationAreaDto);
        URI uri = uriInfo.getAbsolutePathBuilder().path(String.valueOf(calculationAreaDto.getId())).build();
        return Response.created(uri).entity(calculationAreaDto).build();
    }

    @PUT
    @Path("{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Update CalculationArea")
    public Response update(@PathParam("id") Integer id, CalculationAreaDto calculationAreaDto) throws SymphonyStandardAppException {
        calculationAreaDto.setId(id);
        calculationAreaDto = calculationAreaService.update(calculationAreaDto);
        return Response.ok(calculationAreaDto).build();
    }

    @DELETE
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Delete CalculationArea")
    public Response deleteCalcAreaSensMatrix(@PathParam("id") Integer id) throws SymphonyStandardAppException {
        calculationAreaService.delete(id);
        return Response.ok().build();
    }
}
