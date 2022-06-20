package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import se.havochvatten.symphony.dto.MetadataDto;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.service.MetaDataService;

import javax.annotation.security.RolesAllowed;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Stateless
@Api(value = "/metadata",
        produces = MediaType.APPLICATION_JSON,
        consumes = MediaType.APPLICATION_JSON)
@Path("metadata")
@RolesAllowed("GRP_SYMPHONY")
public class MetaDataREST {
    @EJB
    MetaDataService metaDataService;

    @GET
    @ApiOperation(value = "List all metadata for ecocomponents and pressures for baseLineVersion",
			response = MetadataDto.class)
    @Produces({MediaType.APPLICATION_JSON})
    @Path("{baselineName}")
    public MetadataDto findAll(@PathParam("baselineName") String baselineName) throws SymphonyStandardAppException {
        return metaDataService.findMetadata(baselineName);
    }
}
