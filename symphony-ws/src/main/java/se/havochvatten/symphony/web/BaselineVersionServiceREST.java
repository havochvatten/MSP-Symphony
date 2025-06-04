package se.havochvatten.symphony.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.mapper.BaselineVersionDtoMapper;
import se.havochvatten.symphony.service.BaselineVersionService;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.CacheControl;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Date;
import java.util.List;

@Stateless
@Tag(name = "/baselineversion")
@Path("baselineversion")
@RolesAllowed("GRP_SYMPHONY")
public class BaselineVersionServiceREST {
    @EJB
    BaselineVersionService baselineVersionService;

    @GET
    @Operation(summary = "List all BaselineVersion")
    @Produces({MediaType.APPLICATION_JSON})
    public Response findAll() {
        List<BaselineVersion> baselineVersions = baselineVersionService.findAll();
        return Response.ok(BaselineVersionDtoMapper.mapEntitiesToDtos(baselineVersions)).build();
    }

    @GET
    @Operation(summary = "Get BaselineVersion by name")
    @Produces({MediaType.APPLICATION_JSON})
    @Path("/name/{name}")
    public Response getByName(@PathParam("name") String name) throws SymphonyStandardAppException {
        BaselineVersion baselineVersion = baselineVersionService.getVersionByName(name);
        return Response.ok(BaselineVersionDtoMapper.mapEntityToDto(baselineVersion)).build();
    }

    @GET
    @Operation(summary = "Get BaselineVersion by date (date long - number of milliseconds since 1970)")
    @Produces({MediaType.APPLICATION_JSON})
    @Consumes({MediaType.APPLICATION_JSON})
    @Path("/date/{date}")
    public Response getByDate(@PathParam("date") long date) throws SymphonyStandardAppException {
        BaselineVersion baselineVersion = baselineVersionService.getBaselineVersionByDate(new Date(date));
        return Response.ok(BaselineVersionDtoMapper.mapEntityToDto(baselineVersion)).build();
    }

    @GET
    @Operation(summary = "Get current BaselineVersion (today)")
    @Produces({MediaType.APPLICATION_JSON})
    @Consumes({MediaType.APPLICATION_JSON})
    @Path("/current")
    public Response getCurrent() throws SymphonyStandardAppException {
        BaselineVersion baselineVersion = baselineVersionService.getBaselineVersionByDate(new Date());

        var cc = new CacheControl();
        cc.setMaxAge(WebUtil.ONE_YEAR_IN_SECONDS);

        return Response.ok(BaselineVersionDtoMapper.mapEntityToDto(baselineVersion)).
                cacheControl(cc).
                build();
    }
}
