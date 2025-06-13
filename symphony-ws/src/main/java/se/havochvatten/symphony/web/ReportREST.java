package se.havochvatten.symphony.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import se.havochvatten.symphony.entity.CalculationResult;
import se.havochvatten.symphony.entity.CompoundComparison;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.service.CalcService;
import se.havochvatten.symphony.service.PropertiesService;
import se.havochvatten.symphony.service.ReportService;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ejb.EJB;
import jakarta.inject.Inject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

import static jakarta.ws.rs.core.Response.ok;
import static jakarta.ws.rs.core.Response.status;
import static se.havochvatten.symphony.web.CalculationREST.getImplicitDiffCoverageFromCalcId;
import static se.havochvatten.symphony.web.CalculationREST.hasAccess;


@Path("/report")
@Tag(name ="/report")
public class ReportREST {
    private static final Logger logger = Logger.getLogger(ReportREST.class.getName());

    private static final ObjectMapper mapper = new ObjectMapper();

    private static final String contentDispositionStr = "Content-Disposition";

    @Inject
    private ReportService reportService;

    @Inject
    private CalcService calcService;

    @EJB
    PropertiesService props;

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @Operation(summary = "Return data for report associated with calculation")
    public Response getReport(@Context HttpServletRequest req,
                              @PathParam("id") int id,
                              @DefaultValue("") @QueryParam("lang") String preferredLanguage,
                              @Context UriInfo uriInfo)
        throws FactoryException, TransformException, SymphonyStandardAppException, IOException {
        logger.log(Level.INFO, () -> String.format("Fetching report %d ",id));
        var calc = Optional.ofNullable(calcService.getCalculation(id)).orElseThrow(NotFoundException::new);

        if (hasAccess(calc, req.getUserPrincipal()))
            return ok(reportService.generateReportData(calc, true,
                preferredLanguage.isEmpty() ?
                    props.getProperty("meta.default_language") :
                    preferredLanguage)).build();
        else
            return status(Response.Status.UNAUTHORIZED).build();
    }

    @GET
    @Path("/{id}/geotiff")
    @Produces({"image/geotiff"})
    @RolesAllowed("GRP_SYMPHONY")
    @Operation(summary = "Returns calculation result image")
     public Response getResultGeoTIFFImage(@Context HttpServletRequest req, @PathParam("id") int id) {
        var calc = Optional.ofNullable(calcService.getCalculation(id)).orElseThrow(NotFoundException::new);

        if (calc.isBaselineCalculation() || calc.getOwner().equals(req.getUserPrincipal().getName()))
            return ok(calc.getRasterData()).
                    header(contentDispositionStr,
                            "attachment; filename=\""+calc.getId()+"-" + WebUtil.escapeFilename(calc.getCalculationName()) +
                                    ".tiff\"").
                    build();
        else
            return status(Response.Status.UNAUTHORIZED).build();
    }

    @GET
    @Path("/comparison/{a}/{b}/geotiff")
    @Produces({"image/geotiff"})
    @RolesAllowed("GRP_SYMPHONY")
    @Operation(summary = "Returns comparison result image")
    public Response getResultGeoTIFFImage(@Context HttpServletRequest req, @PathParam("a") int baseId, @PathParam("b") int relativeId) throws IOException {

        try {
            var diff = CalculationREST.getDiffCoverageFromCalcIds(calcService, req, baseId, relativeId);

            return ok(calcService.writeGeoTiff(diff)).
                header(contentDispositionStr,
                    "attachment; filename=\"" +
                        "Comparison_report-calculationIDs_-_" + baseId + "-" + relativeId + ".tiff\"").
                build();
        } catch (NotAuthorizedException ax) {
            return status(Response.Status.UNAUTHORIZED).build();
        } catch (SymphonyStandardAppException sx) {
            return status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GET
    @Path("/comparison/{a}/geotiff")
    @Produces({"image/geotiff"})
    @RolesAllowed("GRP_SYMPHONY")
    @Operation(summary = "Returns comparison result image for comparison by implicit baseline")
    public Response getResultGeoTIFFImage(@Context HttpServletRequest req, @PathParam("a") int scenarioId,
                                          @DefaultValue("false") @QueryParam("reverse") boolean reverse) throws IOException {
        try {
            var diff = getImplicitDiffCoverageFromCalcId(calcService, req, scenarioId, reverse);

            return ok(calcService.writeGeoTiff(diff)).
                header(contentDispositionStr,
                    "attachment; filename=\"" + comparisonFilename(scenarioId, reverse) + ".tiff\"").
                build();
        } catch (NotAuthorizedException ax) {
            return status(Response.Status.UNAUTHORIZED).build();
        } catch (SymphonyStandardAppException sx) {
            return status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GET
    @Path("/{id}/csv")
    @Produces(MediaType.TEXT_PLAIN)
    @RolesAllowed("GRP_SYMPHONY")
    @Operation(summary = "Returns aggregated calculation results as CSV file")
    // TODO Parameterize with locale front frontend
    public Response getResultCSV(@Context HttpServletRequest req, @PathParam("id") int id)
            throws SymphonyStandardAppException {
        var calc = Optional.ofNullable(calcService.getCalculation(id)).orElseThrow(NotFoundException::new);
        if (hasAccess(calc, req.getUserPrincipal()))
            return ok(reportService.generateCSVReport(calc, req.getLocale())).
                    header(contentDispositionStr,
                            "attachment; filename=\""+calc.getId()+"-"+WebUtil.escapeFilename(calc.getCalculationName())+
                                    "-utf8.csv\"").
                    build();
        else
            return status(Response.Status.UNAUTHORIZED).build();
    }

    @GET
    @Path("/comparison/{a}/{b}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @Operation(summary = "Return data for a differential scenario report based on two disparate calculations "
                        + "covering the same area")
    public Response getComparisonReport(@Context HttpServletRequest req,
                                        @PathParam("a") int baseId,
                                        @PathParam("b") int scenarioId,
                                        @DefaultValue("") @QueryParam("lang") String preferredLanguage,
                                        @Context UriInfo uriInfo) {
        logger.log(Level.INFO, () -> String.format("Comparing report %d and %d", baseId, scenarioId));
        try {
            var baseRes = Optional.ofNullable(calcService.getCalculation(baseId)).orElseThrow(NotFoundException::new);
            var scenarioRes = Optional.ofNullable(calcService.getCalculation(scenarioId)).orElseThrow(NotFoundException::new);

            if (hasAccess(baseRes, req.getUserPrincipal()) && hasAccess(scenarioRes, req.getUserPrincipal()) )
                return ok(reportService.generateComparisonReportData(baseRes, scenarioRes, false, false, preferredLanguage)).build();
            else
                return status(Response.Status.UNAUTHORIZED).build();
        } catch (Exception e) {
            return status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }

        // Image is available at /calculation/comparison/{a}/{b}. (computed on the fly, and cached client-side)
    }

    @GET
    @Path("/comparison/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @Operation(summary = "Return data for differential scenario report using an implicit baseline calculation")
    public Response getComparisonReport(@Context HttpServletRequest req,
                                        @PathParam("id") int scenarioId,
                                        @DefaultValue("") @QueryParam("lang") String preferredLanguage,
                                        @DefaultValue("false") @QueryParam("reverse") boolean reverse,
                                        @Context UriInfo uriInfo) {
        logger.log(Level.INFO, () -> String.format("Comparing report %d with baseline", scenarioId));
        try {
            var scenarioRes = Optional.ofNullable(calcService.getCalculation(scenarioId)).orElseThrow(NotFoundException::new);

            if (hasAccess(scenarioRes, req.getUserPrincipal())) {

                var implicitResult = calcService.getImplicitBaselineCalculation(scenarioRes);

                if (reverse) {
                    return ok(reportService.generateComparisonReportData(scenarioRes, implicitResult, true, true, preferredLanguage)).build();
                } else {
                    return ok(reportService.generateComparisonReportData(implicitResult, scenarioRes, true, false, preferredLanguage)).build();
                }
            }
            else
                return status(Response.Status.UNAUTHORIZED).build();
        } catch (Exception e) {
            return status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GET
    @Path("/comparison/{a}/{b}/csv")
    @Produces(MediaType.TEXT_PLAIN)
    @RolesAllowed("GRP_SYMPHONY")
    @Operation(summary = "Return comparison report as CSV file")
    public Response getComparisonReport(@Context HttpServletRequest req,
                                        @PathParam("a") int baseId,
                                        @PathParam("b") int scenarioId)
            throws SymphonyStandardAppException {
        CalculationResult
            calcA = Optional.ofNullable(calcService.getCalculation(baseId)).orElseThrow(NotFoundException::new),
            calcB = Optional.ofNullable(calcService.getCalculation(scenarioId)).orElseThrow(NotFoundException::new);

        if (hasAccess(calcA, req.getUserPrincipal()) && hasAccess(calcB, req.getUserPrincipal()))
            return ok(reportService.generateCSVComparisonReport(calcA, calcB, req.getLocale())).
                header(contentDispositionStr,
                    "attachment; filename=\"" + comparisonFilename(baseId, scenarioId) + "_-utf8.csv\"").
                build();
        else
            return status(Response.Status.UNAUTHORIZED).build();
    }

    @GET
    @Path("/comparison/{id}/csv")
    @Produces(MediaType.TEXT_PLAIN)
    @RolesAllowed("GRP_SYMPHONY")
    @Operation(summary = "Return comparison report as CSV file using an implicit baseline calculation")
    public Response getComparisonReport(@Context HttpServletRequest req,
                                        @PathParam("id") int scenarioId,
                                        @DefaultValue("false") @QueryParam("reverse") boolean reverse)
        throws SymphonyStandardAppException {
        CalculationResult
            scenarioRes = Optional.ofNullable(calcService.getCalculation(scenarioId)).orElseThrow(NotFoundException::new);

        if (hasAccess(scenarioRes, req.getUserPrincipal())) {

            var implicitResult = calcService.getImplicitBaselineCalculation(scenarioRes);

            String fileName = comparisonFilename(scenarioId, reverse);
            String csv = reverse ?
                reportService.generateCSVComparisonReport(scenarioRes, implicitResult, req.getLocale()) :
                reportService.generateCSVComparisonReport(implicitResult, scenarioRes, req.getLocale());


            return ok(csv).
                header(contentDispositionStr,
                    "attachment; filename=\"" + fileName + "_-utf8.csv\"").
                build();
        }
        else
            return status(Response.Status.UNAUTHORIZED).build();
    }

    @GET
    @Path("/multi-comparison/{id}/{format: (json|ods)}")
    @Produces({ MediaType.APPLICATION_JSON,
                "application/vnd.oasis.opendocument.spreadsheet" })
    @RolesAllowed("GRP_SYMPHONY")
    @Operation(summary = "Return compound comparison data as ODS file")
    public Response getMultiComparisonReport(@Context HttpServletRequest req,
                                             @PathParam("id") Integer id,
                                             @PathParam("format") String format,
                                             @DefaultValue("false") @QueryParam("nonzero") boolean excludeZeroes,
                                             @DefaultValue("false") @QueryParam("combined") boolean includeCombinedSheet,
                                             @DefaultValue("") @QueryParam("meta-terms") String metatermsParam,
                                             @DefaultValue("en") @QueryParam("lang") String preferredLanguage) {

        try {
            CompoundComparison cmp = calcService.getCompoundComparison(id, req.getUserPrincipal());
            String attachmentHeader =
                "attachment; filename=\"Compound_comparison_-_" + WebUtil.escapeFilename(cmp.getName()) +
                    (format.equals("json") ? ".json" : ".ods");

            Map<String, String> metaTerms = metatermsParam.isEmpty() ?
                Map.of() : mapper.readValue(metatermsParam, Map.class);

            try {
                if(format.equals("json"))
                    return ok(reportService.generateMultiComparisonAsJSON(cmp, preferredLanguage, excludeZeroes)).
                        header(contentDispositionStr, attachmentHeader).build();
                else {
                    byte[] ods =
                        reportService.generateMultiComparisonAsODS(cmp, preferredLanguage,
                                                                   excludeZeroes, includeCombinedSheet, metaTerms);
                    return ok(ods).
                        header(contentDispositionStr,attachmentHeader).build();
                }

            } catch (Exception e) {
                return status(Response.Status.INTERNAL_SERVER_ERROR).build();
            }
        } catch (Exception e) {
            return status(Response.Status.UNAUTHORIZED).build();
        }
    }

    private static String comparisonFilename(int a, boolean reversed) {
        return comparisonFilename(a, null, reversed);
    }

    private static String comparisonFilename(int a, int b) {
        return comparisonFilename(a, b, false);
    }

    private static String comparisonFilename(int a, Integer b, boolean reversed) {
        if(b == null)
            return "Comparison_report-implicit" + (reversed ? "-reversed" : "") + "-ID_-_" + a;
        else
            return "Comparison_report-calculationIDs_-_" + a + "-" + b;
    }
}
