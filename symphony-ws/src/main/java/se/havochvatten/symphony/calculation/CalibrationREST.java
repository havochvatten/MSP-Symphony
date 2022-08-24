package se.havochvatten.symphony.calculation;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.dto.NormalizationOptions;
import se.havochvatten.symphony.dto.NormalizationType;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.scenario.ScenarioService;
import se.havochvatten.symphony.service.BaselineVersionService;
import se.havochvatten.symphony.service.CalculationAreaService;

import javax.annotation.security.RolesAllowed;
import javax.ejb.EJB;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import java.io.IOException;

/**
 * Calibration REST API
 * <p>
 * This class handles offers endpoints pertaining to calculation of calibration data (normalization
 * constants, rarity indices etc).
 */

@Path("/calibration")
@Api(value = "/calibration")
@RolesAllowed("GRP_SYMPHONY_ADMIN")
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

    @PUT
    @Path("/percentile-normalization-values/{scenarioId}/{calcAreaId}")
    @ApiOperation(value = "Computes and sets percentile normalization value for a given calculation area")
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

        var percentileValue = calibrationService.calcPercentileNormalizationValue(req,
            scenario);
        LOG.info("### Computed PERCENTILE normalization value={}", percentileValue);

        caService.updateMaximumValue(calculationAreaId, percentileValue);
        LOG.info("Stored value for calculation area {}", calculationAreaId);

        return Response.ok(percentileValue).build();
    }
}
