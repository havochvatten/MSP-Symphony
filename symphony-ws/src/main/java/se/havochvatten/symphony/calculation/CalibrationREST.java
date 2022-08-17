package se.havochvatten.symphony.calculation;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.service.BaselineVersionService;

import javax.annotation.security.RolesAllowed;
import javax.ejb.EJB;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
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
    @EJB
    BaselineVersionService baselineVersionService;

    @Inject
    private CalibrationService calibrationService;

    @GET
    @Path("/rarity-indices/{baseline}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Gets baseline-global rarity indices (or actually its inverse, i.e. " +
        "commonness)")
    public Response calcGlobalCommonnessIndices(@Context HttpServletRequest req,
                                                @PathParam("baseline") String baselineName)
        throws SymphonyStandardAppException, IOException {
        BaselineVersion baseline = baselineVersionService.getVersionByName(baselineName);

        var sums = calibrationService.getGlobalCommonnessIndicesIndexedByTitle(baseline);

        // Store in table in database? (indexed by meta_id?)
        return Response.ok(sums).build();
    }
}
