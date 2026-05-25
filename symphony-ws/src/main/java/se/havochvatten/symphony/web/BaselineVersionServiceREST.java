package se.havochvatten.symphony.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import se.havochvatten.symphony.dto.UserDto;
import jakarta.annotation.security.PermitAll;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.mapper.BaselineVersionDtoMapper;
import se.havochvatten.symphony.service.BaselineVersionService;
import se.havochvatten.symphony.service.UserService;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.CacheControl;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.IOException;
import se.havochvatten.symphony.web.publicfilter.ConditionalPublic;

import java.util.Date;
import java.util.List;

@Stateless
@Tag(name = "/baselineversion")
@Path("baselineversion")
@RolesAllowed("GRP_SYMPHONY")
public class BaselineVersionServiceREST {
    @EJB
    BaselineVersionService baselineVersionService;

    @EJB
    UserService userService;

    @Context
    HttpServletRequest req;

    @GET
    @Operation(summary = "List all BaselineVersion")
    @Produces({MediaType.APPLICATION_JSON})
    @RolesAllowed("GRP_SYMPHONY")
    public Response findAll() {
        List<BaselineVersion> baselineVersions = baselineVersionService.findAll();
        return Response.ok(BaselineVersionDtoMapper.mapEntitiesToDtos(baselineVersions)).build();
    }

    @GET
    @Operation(summary = "Get active baseline for the current user")
    @Produces({MediaType.APPLICATION_JSON})
    @Path("/active")
    @RolesAllowed("GRP_SYMPHONY")
    public Response getActive() throws SymphonyStandardAppException, IOException {
        UserDto user = userService.getUser(req.getUserPrincipal());
        BaselineVersion baselineVersion = baselineVersionService.getActiveBaselineVersionForUser(user);

        CacheControl cc = new CacheControl();
        cc.setNoStore(true);
        return Response.ok(BaselineVersionDtoMapper.mapEntityToDto(baselineVersion))
                .cacheControl(cc)
                .build();
    }

    @GET
    @Operation(summary = "Get BaselineVersion by name")
    @Produces({MediaType.APPLICATION_JSON})
    @Path("/name/{name}")
    @RolesAllowed("GRP_SYMPHONY")
    public Response getByName(@PathParam("name") String name) throws SymphonyStandardAppException {
        BaselineVersion baselineVersion = baselineVersionService.getVersionByName(name);
        return Response.ok(BaselineVersionDtoMapper.mapEntityToDto(baselineVersion)).build();
    }

    @GET
    @Operation(summary = "Get BaselineVersion by date (date long - number of milliseconds since 1970)")
    @Produces({MediaType.APPLICATION_JSON})
    @Consumes({MediaType.APPLICATION_JSON})
    @Path("/date/{date}")
    @RolesAllowed("GRP_SYMPHONY")
    public Response getByDate(@PathParam("date") long date) throws SymphonyStandardAppException {
        BaselineVersion baselineVersion = baselineVersionService.getBaselineVersionByDate(new Date(date));
        return Response.ok(BaselineVersionDtoMapper.mapEntityToDto(baselineVersion)).build();
    }

    @GET
    @Operation(summary = "Get current BaselineVersion (today)")
    @Produces({MediaType.APPLICATION_JSON})
    @Consumes({MediaType.APPLICATION_JSON})
    @Path("/current")
    @PermitAll
    @ConditionalPublic(roles={"GRP_SYMPHONY"})
    public Response getCurrent() throws SymphonyStandardAppException {
        BaselineVersion baselineVersion = baselineVersionService.getBaselineVersionByDate(new Date());

        var cc = new CacheControl();
        cc.setMaxAge(WebUtil.ONE_YEAR_IN_SECONDS);

        return Response.ok(BaselineVersionDtoMapper.mapEntityToDto(baselineVersion)).
                cacheControl(cc).
                build();
    }

}
