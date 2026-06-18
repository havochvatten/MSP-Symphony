package se.havochvatten.symphony.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.security.PermitAll;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.dto.MetadataDto;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.service.ScenarioService;
import se.havochvatten.symphony.service.MetaDataService;
import se.havochvatten.symphony.service.PropertiesService;

import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import se.havochvatten.symphony.web.filter.PublicOrRestricted;

@Stateless
@Tag(name ="/metadata")
@Path("metadata")
@PermitAll
@PublicOrRestricted
public class MetaDataREST {
    @EJB
    MetaDataService metaDataService;

    @EJB
    ScenarioService scenarioService;

    @EJB
    PropertiesService props;

    @Context
    HttpServletRequest req;

    @GET
    @Operation(summary = "List all metadata for ecocomponents and pressures for baseLineVersion")
    @Produces({MediaType.APPLICATION_JSON})
    @Path("{baselineName}")
    public MetadataDto findAll(@PathParam("baselineName") String baselineName,
                               @DefaultValue("0") @QueryParam("scenarioId") int activeScenarioId,
                               @DefaultValue("") @QueryParam("lang") String preferredLanguage ) throws SymphonyStandardAppException {
        // Public (unauthenticated) callers must not be able to read other users' private scenario
        // band selections, so ignore scenarioId unless the caller is an authenticated user.
        if (req == null || req.getUserPrincipal() == null) {
            activeScenarioId = 0;
        }
        MetadataDto metaData = metaDataService.findMetadata(baselineName,
                preferredLanguage.isEmpty() ?
                    props.getProperty("meta.default_language") :
                    preferredLanguage, activeScenarioId > 0);

        if(activeScenarioId > 0) {
            int[] ecosystemIds, pressureIds;
            ecosystemIds = scenarioService.getIncludedBands(activeScenarioId, LayerType.ECOSYSTEM);
            pressureIds = scenarioService.getIncludedBands(activeScenarioId, LayerType.PRESSURE);
            metaData.setSelectedBands(ecosystemIds, pressureIds);
        }

        return metaData;
    }
}
