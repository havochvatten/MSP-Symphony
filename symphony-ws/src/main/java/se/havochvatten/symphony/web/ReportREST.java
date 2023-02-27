package se.havochvatten.symphony.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import se.havochvatten.symphony.calculation.CalcUtil;
import se.havochvatten.symphony.calculation.CalculationREST;
import se.havochvatten.symphony.dto.ComparisonReportResponseDto;
import se.havochvatten.symphony.dto.ReportResponseDto;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.calculation.CalcService;
import se.havochvatten.symphony.service.ReportService;

import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.*;
import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.util.logging.Logger;

import static javax.ws.rs.core.Response.ok;
import static javax.ws.rs.core.Response.status;
import static se.havochvatten.symphony.calculation.CalculationREST.hasAccess;


@Path("/report")
@Api(value = "/report")
public class ReportREST {
    private static final Logger logger = Logger.getLogger(ReportREST.class.getName());

    @Inject
    private ReportService reportService;

    @Inject
    private CalcService calcService;

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Return data for report associated with calculation",
            response = ReportResponseDto.class)
    public Response getReport(@Context HttpServletRequest req,
                              @PathParam("id") int id,
                              @Context UriInfo uriInfo)
        throws FactoryException, TransformException, JsonProcessingException {
        logger.info("Fetching report "+id);
        var calc = CalcUtil.getCalculationResultFromSessionOrDb(id, req.getSession(),
            calcService).orElseThrow(NotFoundException::new);

        if (hasAccess(calc, req.getUserPrincipal()))
            return ok(reportService.generateReportData(calc, true)).build();
        else
            return status(Response.Status.UNAUTHORIZED).build();
    }

    private static String escapeFilename(String s) {
        return s.replaceAll("\\W+", "-"); // Use RFC 5987 to quote properly?
    }

    @GET
    @Path("/{id}/geotiff")
    @Produces({"image/geotiff"})
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Returns calculation result image")
     public Response getResultGeoTIFFImage(@Context HttpServletRequest req, @PathParam("id") int id) {
        var calc = CalcUtil.getCalculationResultFromSessionOrDb(id, req.getSession(),
            calcService).orElseThrow(BadRequestException::new);

        if (calc.isBaselineCalculation() || calc.getOwner().equals(req.getUserPrincipal().getName()))
            return ok(calc.getRasterData()).
                    header("Content-Disposition",
                            "attachment; filename=\""+calc.getId()+"-" + escapeFilename(calc.getCalculationName()) +
                                    ".tiff\"").
                    build();
        else
            return status(Response.Status.UNAUTHORIZED).build();
    }

    @GET
    @Path("/comparison/{a}/{b}/geotiff")
    @Produces({"image/geotiff"})
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Returns comparison result image")
    public Response getResultGeoTIFFImage(@Context HttpServletRequest req, @PathParam("a") int baseId, @PathParam("b") int relativeId) throws IOException {

        try {
            var diff = CalculationREST.getDiffCoverageFromCalcIds(calcService, req, baseId, relativeId);

            return ok(calcService.writeGeoTiff(diff)).
                header("Content-Disposition",
                    "attachment; filename=\"" +
                        "Comparison_report-calculationIDs_-_" + baseId + "-" + relativeId + ".tiff\"").
                build();
        } catch (NotAuthorizedException ax) {
            return status(Response.Status.UNAUTHORIZED).build();
        }
    }

    @GET
    @Path("/{id}/csv")
    @Produces(MediaType.TEXT_PLAIN)
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Returns aggregated calculation results as CSV file")
    // TODO Parameterize with locale front frontend
    public Response getResultCSV(@Context HttpServletRequest req, @PathParam("id") int id)
            throws SymphonyStandardAppException {
        var calc = CalcUtil.getCalculationResultFromSessionOrDb(id, req.getSession(),
            calcService).orElseThrow(BadRequestException::new);
        if (hasAccess(calc, req.getUserPrincipal()))
            return ok(reportService.generateCSVReport(calc, req.getLocale())).
                    header("Content-Disposition",
                            "attachment; filename=\""+calc.getId()+"-"+escapeFilename(calc.getCalculationName())+
                                    "-utf8.csv\"").
                    build();
        else
            return status(Response.Status.UNAUTHORIZED).build();
    }

    @GET
    @Path("/comparison/{a}/{b}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Return data for scenario report associated with two calculations",
            response = ComparisonReportResponseDto.class)
    public Response getComparisonReport(@Context HttpServletRequest req,
                                        @PathParam("a") int baseId,
                                        @PathParam("b") int scenarioId,
                                        @Context UriInfo uriInfo) {
        logger.info("Comparing report "+baseId+" and "+scenarioId);
        try {
            var baseRes =
                CalcUtil.getCalculationResultFromSessionOrDb(baseId, req.getSession(), calcService)
                    .orElseThrow(javax.ws.rs.BadRequestException::new);
            var scenarioRes =
                CalcUtil.getCalculationResultFromSessionOrDb(scenarioId, req.getSession(), calcService)
                    .orElseThrow(javax.ws.rs.BadRequestException::new);

            if (hasAccess(baseRes, req.getUserPrincipal()) && hasAccess(scenarioRes, req.getUserPrincipal()) )
                return ok(reportService.generateComparisonReportData(baseRes, scenarioRes)).build();
            else
                return status(Response.Status.UNAUTHORIZED).build();
        } catch (Exception e) {
            return status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }

        // Image is available at /calculation/comparison/{a}/{b}. (computed on the fly, and cached client-side)
    }

}
