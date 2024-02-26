package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.entity.NationalArea;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.service.AreasService;
import se.havochvatten.symphony.service.PropertiesService;

import javax.annotation.security.RolesAllowed;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Optional;

@Stateless
@Api(value = "/areas",
        produces = MediaType.APPLICATION_JSON,
        consumes = MediaType.APPLICATION_JSON)
@Path("areas")
public class AreasREST {
    private static final Logger LOG = LoggerFactory.getLogger(AreasREST.class);

    @EJB
    AreasService areasService;

    @Inject
    private PropertiesService props;

    private final static String TYPE_TYPES = "TYPES";
    private final static String TYPE_BOUNDARY = "BOUNDARY";

    @GET
    @ApiOperation(value = "JSON array with all types of areas")
    @Produces({MediaType.APPLICATION_JSON})
    @RolesAllowed("GRP_SYMPHONY")
    public Response getAreaTypes() throws SymphonyStandardAppException {
        String countryCode = props.getProperty("areas.countrycode");
        if (countryCode == null) {
            LOG.error("Fatal error: Mandatory \"areas.countrycode\" property not set, returning empty areas!");
            return Response.ok("[]").build(); // or some error
        }

        NationalArea areas = areasService.getNationalAreaByCountryAndType(countryCode, TYPE_TYPES);

        var cc = new CacheControl();
        cc.setMaxAge(WebUtil.ONE_YEAR_IN_SECONDS);
        return Response.ok(areas.getTypesJson()).cacheControl(cc).build();
    }

    @GET
    @Path("{type}")
    @ApiOperation(value = "JSON structure of all areas for given type")
    @Produces({MediaType.APPLICATION_JSON})
    @RolesAllowed("GRP_SYMPHONY")
    public Response getAreas(@PathParam("type") String type) throws SymphonyStandardAppException {
        String countryCode = props.getProperty("areas.countrycode");

        NationalArea areas = areasService.getNationalAreaByCountryAndType(countryCode,
				type);

        var cc = new CacheControl();
        cc.setMaxAge(WebUtil.ONE_YEAR_IN_SECONDS);
        return Response.ok(areas.getAreasJson()).cacheControl(cc).build();
    }

    @GET
    @Path("/boundary")
    @ApiOperation(value = "JSON polygons for country that user created areas must keep within (not cross)")
    @Produces({MediaType.APPLICATION_JSON})
    @RolesAllowed("GRP_SYMPHONY")
    public Response getBoundaries() throws SymphonyStandardAppException {
        String countryCode = props.getProperty("areas.countrycode");
        if (countryCode == null) {
            LOG.error("Fatal error: Mandatory \"areas.countrycode\" property not set, unable to fetch boundary areas!");
            throw new InternalServerErrorException("Server misconfiguration");
        }

        NationalArea areas = areasService.getNationalAreaByCountryAndType(countryCode,
            TYPE_BOUNDARY);

        var cc = new CacheControl();
        cc.setMaxAge(WebUtil.ONE_YEAR_IN_SECONDS);
        return Response.ok(areas.getAreasJson()).cacheControl(cc).build();
    }

    @GET
    @Path("/download")
    @ApiOperation(value = "Download areas as a .shp file bundle (.zip archive)")
    @Produces("application/octet-stream")
    @RolesAllowed("GRP_SYMPHONY")
    public Response downloadAreas(@QueryParam("path") String path) throws SymphonyStandardAppException {
        String countryCode = props.getProperty("areas.countrycode");
        String[] statePaths = path.split(",");

        if (statePaths.length == 0) {
            throw new BadRequestException("No state path provided");
        }

        Optional<AreasService.fileStruct> file = areasService.getAreasAsShapeFile(statePaths, countryCode);

        if (file.isEmpty()) {
            throw new NotFoundException("No areas found");
        }

        return Response.ok(file.get().content())
            .header("Content-Disposition", "attachment; filename=" + file.get().fileName())
            .build();
    }
}
