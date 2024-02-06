package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.dto.MetadataDto;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.scenario.ScenarioService;
import se.havochvatten.symphony.service.MetaDataService;
import se.havochvatten.symphony.service.PropertiesService;

import javax.annotation.security.RolesAllowed;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.ws.rs.*;
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

    @EJB
    ScenarioService scenarioService;

    @EJB
    PropertiesService props;

    @GET
    @ApiOperation(value = "List all metadata for ecocomponents and pressures for baseLineVersion",
			response = MetadataDto.class)
    @Produces({MediaType.APPLICATION_JSON})
    @Path("{baselineName}")
    public MetadataDto findAll(@PathParam("baselineName") String baselineName,
                               @DefaultValue("0") @QueryParam("scenarioId") int activeScenarioId,
                               @DefaultValue("") @QueryParam("lang") String preferredLanguage ) throws SymphonyStandardAppException {
        MetadataDto metaData = metaDataService.findMetadata(baselineName,
                preferredLanguage.isEmpty() ?
                    props.getProperty("meta.default_language") :
                    preferredLanguage );

        if(activeScenarioId > 0) {
            int[] ecosystemIds, pressureIds;
            ecosystemIds = scenarioService.getIncludedBands(activeScenarioId, LayerType.ECOSYSTEM);
            pressureIds = scenarioService.getIncludedBands(activeScenarioId, LayerType.PRESSURE);
            metaData.setSelectedBands(ecosystemIds, pressureIds);
        }

        return metaData;
    }
}
