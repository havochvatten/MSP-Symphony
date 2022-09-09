package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import se.havochvatten.symphony.entity.NationalArea;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.service.AreasService;
import se.havochvatten.symphony.service.PropertiesService;

import javax.annotation.security.RolesAllowed;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Stateless
@Api(value = "/areas",
        produces = MediaType.APPLICATION_JSON,
        consumes = MediaType.APPLICATION_JSON)
@Path("areas")
public class AreasREST {
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
        String countryCodeIso3 = props.getProperty("areas.countrycode");
        NationalArea areas = areasService.getNationalAreaByCountryAndType(countryCodeIso3, TYPE_TYPES);
        String areasJson = areas.getTypesJson();
        var cc = new CacheControl();
        cc.setMaxAge(WebUtil.ONE_YEAR_IN_SECONDS);

        return Response.ok(areasJson).cacheControl(cc).build();
    }

    @GET
    @Path("{type}")
    @ApiOperation(value = "JSON structure of all areas for given type")
    @Produces({MediaType.APPLICATION_JSON})
    @RolesAllowed("GRP_SYMPHONY")
    public Response getAreas(@PathParam("type") String type) throws SymphonyStandardAppException {
        String countryCodeIso3 = props.getProperty("areas.countrycode"); // TODO: Get from baseline?
        NationalArea areas = areasService.getNationalAreaByCountryAndType(countryCodeIso3,
				type);
        String areasJson = areas.getAreasJson();
        var cc = new CacheControl();
        cc.setMaxAge(WebUtil.ONE_YEAR_IN_SECONDS);

        return Response.ok(areasJson).cacheControl(cc).build();
    }

    @GET
    @Path("/boundary")
    @ApiOperation(value = "JSON polygons for country that user created areas must keep within (not cross)")
    @Produces({MediaType.APPLICATION_JSON})
    @RolesAllowed("GRP_SYMPHONY")
    public Response getBoundaries() throws SymphonyStandardAppException {
        String countryCodeIso3 = props.getProperty("areas.countrycode");
        NationalArea areas = areasService.getNationalAreaByCountryAndType(countryCodeIso3,
            TYPE_BOUNDARY);
        String areasJson = areas.getAreasJson();
        var cc = new CacheControl();
        cc.setMaxAge(WebUtil.ONE_YEAR_IN_SECONDS);

        return Response.ok(areasJson).cacheControl(cc).build();
    }


}
