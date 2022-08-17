package se.havochvatten.symphony.calculation;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import it.geosolutions.jaiext.stats.MeanSum;
import it.geosolutions.jaiext.stats.Statistics;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.processing.CoverageProcessor;
import org.geotools.coverage.processing.Operations;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.service.BaselineVersionService;
import se.havochvatten.symphony.service.DataLayerService;

import javax.annotation.security.RolesAllowed;
import javax.ejb.EJB;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.util.Arrays;
import java.util.stream.IntStream;

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

    @EJB
    DataLayerService dataLayerService;

    @EJB
    SymphonyCoverageProcessor processor;

    @POST
    @Path("/rarity-indices")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Calculates baseline-global rarity indices (or actually its inverse, i.e. " +
        "commonness)")
    public Response calcGlobalCommonnessIndices(@Context HttpServletRequest req, String baselineName)
        throws SymphonyStandardAppException, IOException {
        BaselineVersion baseline = baselineVersionService.getVersionByName(baselineName);

        var ecoComponents = dataLayerService.getCoverage(LayerType.ECOSYSTEM, baseline.getId());

        // FIXME move to a "CalibrationService"
        final var statsOp = processor.getOperation("Stats");

        var params = statsOp.getParameters();
        params.parameter("source").setValue(ecoComponents);
        var bands = IntStream.range(0, ecoComponents.getNumSampleDimensions()).toArray();
        params.parameter("bands").setValue(bands);
        params.parameter("stats").setValue(new Statistics.StatsType[]{Statistics.StatsType.SUM});
        var result = (GridCoverage2D) processor.doOperation(params);
        var bandStats = (Statistics[][]) result.getProperty("JAI-EXT.stats");

        var sums = Arrays.stream(bandStats)
            .mapToDouble(stats -> (double)stats[0].getResult())
            .toArray();

        // TODO: Store in database as well?
        return Response.ok(sums).build();
    }
}
