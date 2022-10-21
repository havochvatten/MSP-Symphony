package se.havochvatten.symphony.calculation;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.apache.commons.lang3.time.StopWatch;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.referencing.CRS;
import org.locationtech.jts.geom.Envelope;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.MathTransform;
import se.havochvatten.symphony.dto.CalculationResultSlice;
import se.havochvatten.symphony.dto.ScenarioDto;
import se.havochvatten.symphony.entity.CalculationResult;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.scenario.Scenario;
import se.havochvatten.symphony.scenario.ScenarioService;
import se.havochvatten.symphony.service.PropertiesService;
import se.havochvatten.symphony.web.WebUtil;

import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.persistence.NoResultException;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.*;
import java.awt.image.RenderedImage;
import java.security.Principal;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.logging.Level;
import java.util.logging.Logger;

import static javax.ws.rs.core.Response.ok;
import static javax.ws.rs.core.Response.status;
import static se.havochvatten.symphony.web.WebUtil.multiValuedToSingleValuedMap;

/**
 * Calculation REST API
 * <p>
 * This class handles request decoding, result color-mapping and image encoding.
 */

@Path("/calculation")
@Api(value = "/calculation")
public class CalculationREST {
    private static final Logger logger = Logger.getLogger(CalculationREST.class.getName());

    @Inject
    private CalcService calcService;

    @Inject
    private NormalizerService normalizationFactory;

    @Inject
    private PropertiesService props;

    @Inject
    private ScenarioService scenarioService;

    @POST
    @Path("/sum/{operation}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Computes cumulative impact sum")
    public CalculationResultSlice sum(@Context HttpServletRequest req,
                                      @Context UriInfo uriInfo,
                                      @PathParam("operation") String operation,
                                      ScenarioDto dto)
            throws Exception {
        if (dto == null)
            throw new BadRequestException();
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");

        var persistedScenario = scenarioService.findById(dto.id);
        if (!persistedScenario.getOwner().equals(req.getUserPrincipal().getName()))
            throw new ForbiddenException("User not owner of scenario");

        var watch = new StopWatch();
        watch.start();
        logger.info("Performing "+operation+" calculation for " + dto.name + "...");
        var operationParams = uriInfo.getQueryParameters();
        CalculationResult result = calcService.calculateScenarioImpact(req, new Scenario(dto, calcService),
            operation, multiValuedToSingleValuedMap(operationParams));
        watch.stop();
        logger.log(Level.INFO, "DONE ({0} ms)", watch.getTime());

        return new CalculationResultSlice(result);
    }

    // TODO return full CalculationResult instead, use when loading calculation (or see below)
    @GET
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Get a specified calculation", response = CalculationResultSlice.class)
    public Response getCalculation(@Context HttpServletRequest req, @PathParam("id") int id) {
        try {
            var calculation = CalcUtil.getCalculationResultFromSessionOrDb(id,
                    req.getSession(), calcService).orElseThrow(NotFoundException::new);
            if (calculation.getOwner().equals(req.getUserPrincipal().getName()))
                return ok(new CalculationResultSlice(calculation)).build();
            else
                return status(Response.Status.UNAUTHORIZED).build();
        } catch (NoResultException | NoSuchElementException e) {
            return status(Response.Status.NO_CONTENT).build();
        }
    }

    // TODO Use HTTP PATCH
    @POST
    @Path("{id}")
    @Consumes(MediaType.TEXT_PLAIN) // APPLICATION_JSON_PATCH_JSON_TYPE
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Update name of an existing calculation", response = CalculationResultSlice.class)
    public Response updateName(@Context HttpServletRequest req, @PathParam("id") int id,
                               @QueryParam("action") String action,
                               String newName) {
        if (action.equals("update-name")) {
            var calculation = CalcUtil.getCalculationResultFromSessionOrDb(id,
                req.getSession(), calcService).orElseThrow(NotFoundException::new);
            if (calculation.getOwner().equals(req.getUserPrincipal().getName())
                    && !calculation.isBaselineCalculation()) {
                calculation.setCalculationName(newName);
                var updated = calcService.updateCalculation(calculation);
                return ok(new CalculationResultSlice(updated)).build();
            } else
                return status(Response.Status.UNAUTHORIZED).build();
        } else
            return ok(Response.Status.NOT_IMPLEMENTED).build();
    }

    @GET
    @Path("/all")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Gets all previous computations for the user")
    @RolesAllowed("GRP_SYMPHONY")
    public List<CalculationResultSlice> getAllCalculations(@Context HttpServletRequest req) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");
        else
            return calcService.findAllByUser(req.getUserPrincipal().getName());
    }

    @GET
    @Path("/baseline/{baselineName}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get baseline BaseCalculations for baselineName",
            response = CalculationResultSlice.class, responseContainer = "List")
    @RolesAllowed("GRP_SYMPHONY")
    public Response getBaselineCalculations(@PathParam("baselineName") String baselineName)
            throws SymphonyStandardAppException {
        // baselineId works as revving caching strategy
        var cc = new CacheControl();
        cc.setMaxAge(WebUtil.ONE_YEAR_IN_SECONDS);

        return ok(calcService.getBaseLineCalculations(baselineName)).cacheControl(cc).build();
    }

    @GET
    @Path("{id}/image")
    @Produces({"image/png"})
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Returns calculation result image", response = byte[].class)
    public Response getResultImage(@Context HttpServletRequest req,
                                   @PathParam("id") int id,
                                   @QueryParam("crs") String crs)
            throws Exception {
        var calc = CalcUtil.getCalculationResultFromSessionOrDb(id, req.getSession(),
            calcService).orElseThrow(NotFoundException::new);

        if (!hasAccess(calc, req.getUserPrincipal()))
            return status(Response.Status.UNAUTHORIZED).build();

        var coverage = calc.getCoverage(); // N.B: raw result data, not normalized nor color-mapped
        var scenario = calc.getScenarioSnapshot();

        RasterNormalizer normalizer = normalizationFactory.getNormalizer(scenario.getNormalization().type);
        double normalizationValue = normalizer.apply(coverage, calc.getNormalizationValue());

        Envelope dataEnvelope = new ReferencedEnvelope(coverage.getEnvelope());
        CoordinateReferenceSystem targetCRS;
        Envelope targetEnvelope;
        if (crs == null) {
            targetCRS = coverage.getCoordinateReferenceSystem2D();
            targetEnvelope = dataEnvelope;
        } else {
            targetCRS = CRS.getAuthorityFactory(true).createCoordinateReferenceSystem(crs);
            MathTransform transform = CRS.findMathTransform(
                    coverage.getGridGeometry().getCoordinateReferenceSystem(), targetCRS);
            targetEnvelope = JTS.transform(dataEnvelope, transform);
        }

        RenderedImage image = WebUtil.renderNormalized(coverage, targetCRS, targetEnvelope,
                WebUtil.getSLD(CalculationREST.class.getClassLoader().getResourceAsStream(
                        props.getProperty("data.styles.result"))), normalizationValue);

        logger.info("Encoding result in PNG format...");
        var baos = WebUtil.encode(image, "png");
        logger.log(Level.INFO, "DONE ({0} bytes)", baos.size());

        // Revving caching strategy
        var cc = new CacheControl();
        cc.setMaxAge(WebUtil.ONE_YEAR_IN_SECONDS);
        return ok(baos.toByteArray(), "image/png")
                .header("SYM-Image-Extent", WebUtil.createExtent(targetEnvelope).toString())
                .cacheControl(cc)
                .build();
    }

    @GET
    @Path("/average")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces("text/plain")
    @ApiOperation(value = "Computes cumulative impact average", response = String.class)
    public Response average() {
        return status(Response.Status.NOT_IMPLEMENTED).build();
    }

    @GET
    @Path("/diff/{a}/{b}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces({"image/png"}) // for now
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Computes the difference between two calculations", response = byte[].class)
    public Response getDifferenceImage(@Context HttpServletRequest req,
                                       @PathParam("a") int baseId, @PathParam("b") int scenarioId)
            throws Exception {
        logger.info("Diffing base line calculations " + baseId + " against calculation " + scenarioId);

        var base = CalcUtil.getCalculationResultFromSessionOrDb(baseId, req.getSession(),
            calcService).orElseThrow(javax.ws.rs.BadRequestException::new);
        var scenario =
            CalcUtil.getCalculationResultFromSessionOrDb(scenarioId, req.getSession(),
                calcService).orElseThrow(javax.ws.rs.BadRequestException::new);
        if (!hasAccess(base, req.getUserPrincipal()) || !hasAccess(scenario, req.getUserPrincipal()))
            return status(Response.Status.UNAUTHORIZED).build();

        var diff = calcService.relativeDifference(base.getCoverage(), scenario.getCoverage());
        // TODO Store coverage in user session? (and recalc if necessary?)

        Envelope targetEnvelope = new ReferencedEnvelope(diff.getEnvelope());
        RenderedImage image = WebUtil.render(diff, diff.getCoordinateReferenceSystem2D(),
                targetEnvelope,
                WebUtil.getSLD(CalculationREST.class.getClassLoader().getResourceAsStream(
                        props.getProperty("data.styles.comparison"))));

        logger.info("Encoding result in PNG format...");
        var baos = WebUtil.encode(image, "png");
        logger.log(Level.INFO, "DONE ({0} bytes)", baos.size());

        return ok(baos.toByteArray(), "image/png")
                .header("SYM-Image-Extent", WebUtil.createExtent(targetEnvelope).toString())
                .build();
    }

    @GET
    @Path("/matching/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Returns a list of calculation matching the ROI of specified calculation")
    public List<CalculationResultSlice> getCalculationsWithMatchingGeometry(@Context HttpServletRequest req,
                                                                            @PathParam("id") int id) {
        var base = CalcUtil.getCalculationResultFromSessionOrDb(id, req.getSession(),
            calcService).orElseThrow(javax.ws.rs.NotFoundException::new);
        verifyAccessToCalculation(base, req.getUserPrincipal());

        return calcService.findAllMatchingGeometryByUser(req.getUserPrincipal(), base);
    }

    @GET
    @Path("/last-mask")
    @Produces("image/png")
    @RolesAllowed("GRP_SYMPHONY_ADMIN")
    @ApiOperation(value = "Returns calculation mask for the last calculation (for debugging purposes)")
    public Response getMask(@Context HttpServletRequest req) {
        var session = req.getSession(false);
        if (session == null)
            return Response.status(Response.Status.NO_CONTENT).build();
        return ok(session.getAttribute("mask"), "image/png").build();
    }

    public static boolean hasAccess(CalculationResult calc, Principal user) {
        return calc.isBaselineCalculation() // Baselines are considered public
                || (user != null && calc.getOwner().equals(user.getName()));
    }

    public static void verifyAccessToCalculation(CalculationResult calc, Principal user) {
        if (!hasAccess(calc, user)) {
            throw user != null
                    ? new ForbiddenException("User " + user.getName() + " is not owner of calculation " + calc.getId())
                    : new NotAuthorizedException("User not authorized");
        }
    }
}
