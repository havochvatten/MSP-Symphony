package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import se.havochvatten.symphony.dto.BaselineVersionDto;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.mapper.BaselineVersionDtoMapper;
import se.havochvatten.symphony.service.BaselineVersionService;

import javax.annotation.security.RolesAllowed;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.ws.rs.*;
import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Date;
import java.util.List;

@Stateless
@Api(value = "/baselineversion",
        produces = MediaType.APPLICATION_JSON,
        consumes = MediaType.APPLICATION_JSON)
@Path("baselineversion")
@RolesAllowed("GRP_SYMPHONY")
public class BaselineVersionServiceREST {
    @EJB
    BaselineVersionService baselineVersionService;

    @GET
    @ApiOperation(value = "List all BaselineVersion", response = BaselineVersionDto.class,
            responseContainer = "List")
    @Produces({MediaType.APPLICATION_JSON})
    public Response findAll() throws SymphonyStandardAppException {
        List<BaselineVersion> baselineVersions = baselineVersionService.findAll();
        return Response.ok(BaselineVersionDtoMapper.mapEntitiesToDtos(baselineVersions)).build();
    }

    @GET
    @ApiOperation(value = "Get BaselineVersion by name", response = BaselineVersionDto.class)
    @Produces({MediaType.APPLICATION_JSON})
    @Path("/name/{name}")
    public Response getByName(@PathParam("name") String name) throws SymphonyStandardAppException {
        BaselineVersion baselineVersion = baselineVersionService.getVersionByName(name);
        return Response.ok(BaselineVersionDtoMapper.mapEntityToDto(baselineVersion)).build();
    }

    @GET
    @ApiOperation(value = "Get BaselineVersion by date (date long - number of milliseconds since 1970)",
            response = BaselineVersionDto.class)
    @Produces({MediaType.APPLICATION_JSON})
    @Consumes({MediaType.APPLICATION_JSON})
    @Path("/date/{date}")
    public Response getByDate(@PathParam("date") long date) throws SymphonyStandardAppException {
        BaselineVersion baselineVersion = baselineVersionService.getBaselineVersionByDate(new Date(date));
        return Response.ok(BaselineVersionDtoMapper.mapEntityToDto(baselineVersion)).build();
    }

    @GET
    @ApiOperation(value = "Get current BaselineVersion (today)", response = BaselineVersionDto.class)
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
