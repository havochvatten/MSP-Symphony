package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import se.havochvatten.symphony.entity.NationalArea;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.service.NationalAreaService;

import javax.annotation.security.RolesAllowed;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Stateless
@Api(value = "/nationalarea",
        produces = MediaType.APPLICATION_JSON,
        consumes = MediaType.APPLICATION_JSON)
@Path("nationalarea")
public class NationalAreaRest {
    @EJB
    NationalAreaService nationalAreaService;

    private final static String TYPE_TYPES = "TYPES";
    private final static String TYPE_BOUNDARY = "BOUNDARY";

    @GET
    @Path("/boundary/{countrycodeiso3}")
    @ApiOperation(value = "JSON polygons for country that user created areas must keep within (not cross)",
			response = Response.class)
    @Produces({MediaType.APPLICATION_JSON})
    @RolesAllowed("GRP_SYMPHONY")
    public Response getBoundariesForCountry(@PathParam("countrycodeiso3") String countryCodeIso3) throws SymphonyStandardAppException {
        NationalArea nationalArea = nationalAreaService.getNationalAreaByCountryAndType(countryCodeIso3,
				TYPE_BOUNDARY);
        String areasJson = nationalArea.getAreasJson();
        var cc = new CacheControl();
        cc.setMaxAge(WebUtil.ONE_YEAR_IN_SECONDS);

        return Response.ok(areasJson).cacheControl(cc).build();
    }

    @GET
    @Path("{countrycodeiso3}/{type}")
    @ApiOperation(value = "JSON structure of all national areas for given country code and type", response
			= Response.class)
    @Produces({MediaType.APPLICATION_JSON})
    @RolesAllowed("GRP_SYMPHONY")
    public Response getAreasForCountry(@PathParam("countrycodeiso3") String countryCodeIso3,
									   @PathParam("type") String type) throws SymphonyStandardAppException {
        NationalArea nationalArea = nationalAreaService.getNationalAreaByCountryAndType(countryCodeIso3,
				type);
        String areasJson = nationalArea.getAreasJson();
        var cc = new CacheControl();
        cc.setMaxAge(WebUtil.ONE_YEAR_IN_SECONDS);

        return Response.ok(areasJson).cacheControl(cc).build();
    }

    @GET
    @Path("{countrycodeiso3}")
    @ApiOperation(value = "JSON array with all types of national areas for given country code")
    @Produces({MediaType.APPLICATION_JSON})
    @RolesAllowed("GRP_SYMPHONY")
    public Response getAreaTypesForCountry(@PathParam("countrycodeiso3") String countryCodeIso3)
			throws SymphonyStandardAppException {
        NationalArea nationalArea = nationalAreaService.getNationalAreaByCountryAndType(countryCodeIso3, TYPE_TYPES);
        String areasJson = nationalArea.getTypesJson();
		var cc = new CacheControl();
		cc.setMaxAge(WebUtil.ONE_YEAR_IN_SECONDS);

		return Response.ok(areasJson).cacheControl(cc).build();
    }
}
