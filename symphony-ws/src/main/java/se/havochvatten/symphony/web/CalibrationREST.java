package se.havochvatten.symphony.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.service.BaselineVersionService;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.dto.NormalizationOptions;
import se.havochvatten.symphony.dto.NormalizationType;
import se.havochvatten.symphony.service.ScenarioService;
import se.havochvatten.symphony.service.CalculationAreaService;
import se.havochvatten.symphony.service.CalibrationService;
import se.havochvatten.symphony.service.PropertiesService;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ejb.EJB;
import jakarta.inject.Inject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.CacheControl;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.IOException;
import java.util.Map;

/**
 * Calibration REST API
 * <p>
 * This class handles offers endpoints pertaining to calculation of calibration data (normalization
 * constants, rarity indices etc).
 */

@Path("/calibration")
@Tag(name ="/calibration")
@RolesAllowed({"GRP_SYMPHONY_ADMIN", "GRP_SYMPHONY"})
public class CalibrationREST {
    private static final Logger LOG = LoggerFactory.getLogger(CalibrationREST.class);

    @EJB
    BaselineVersionService baselineVersionService;

    @Inject
    private CalibrationService calibrationService;

    @Inject
    private ScenarioService scenarioService;

    @Inject
    private CalculationAreaService caService;

    @Inject
    private PropertiesService propertiesService;

    @GET
    @Path("/rarity-indices/{baseline}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Gets baseline-global rarity indices (or actually its inverse, i.e. " +
        "commonness)")
    public Response calcGlobalCommonnessIndices(@Context HttpServletRequest req,
                                                @PathParam("baseline") String baselineName)
        throws SymphonyStandardAppException, IOException {
        BaselineVersion baseline = baselineVersionService.getVersionByName(baselineName);

        var sums = calibrationService.getGlobalCommonnessIndicesIndexedByTitle(baseline);

        // TODO: Store in table in database? (indexed by meta_id?)
        return Response.ok(sums).build();
    }

    @PUT
    @Path("/percentile-normalization-values/{scenarioId}/{calcAreaId}")
    @Operation(summary = "Computes and sets percentile normalization value for a given calculation area")
    public Response calcPercentileNormalizationValue(@Context HttpServletRequest req,
                                                    @PathParam("scenarioId") int scenarioId,
                                                    @PathParam("calcAreaId") int calculationAreaId)
        throws SymphonyStandardAppException, IOException, FactoryException, TransformException {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");

        var scenario = scenarioService.findById(scenarioId);
        if (!scenario.getOwner().equals(req.getUserPrincipal().getName()))
            throw new ForbiddenException("User not owner of scenario");

        LOG.info("Performing PERCENTILE calculation for scenario {} and calculation area {}", scenarioId,
            calculationAreaId);
        scenario.setNormalization(new NormalizationOptions(NormalizationType.PERCENTILE));

        var percentileValue = calibrationService.calcPercentileNormalizationValue(scenario);
        LOG.info("### Computed PERCENTILE normalization value={}", percentileValue);

        caService.updateMaximumValue(calculationAreaId, percentileValue);
        LOG.info("Stored value for calculation area {}", calculationAreaId);

        return Response.ok(percentileValue).build();
    }
    
    @GET
    @Path("/percentile-value")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get percentile setting used for value normalization")
    public Response checkPercentileValue(@Context HttpServletRequest req) throws NotAuthorizedException {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");
        CacheControl cc = new CacheControl();
        cc.setMaxAge(WebUtil.ONE_YEAR_IN_SECONDS);
        int percentile = propertiesService.getPropertyAsInt("calc.normalization.histogram.percentile", 95);
        return Response.ok(Map.of("percentileValue", percentile)).cacheControl(cc).build();
    }
}

