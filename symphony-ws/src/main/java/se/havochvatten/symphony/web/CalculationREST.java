package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.apache.commons.lang3.time.StopWatch;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.GridCoverageFactory;
import org.geotools.coverage.processing.CoverageProcessor;
import org.geotools.coverage.util.IntersectUtils;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.referencing.CRS;
import org.geotools.styling.StyledLayerDescriptor;
import org.locationtech.jts.geom.*;
import org.opengis.coverage.Coverage;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.geometry.MismatchedDimensionException;
import org.opengis.parameter.ParameterValueGroup;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.MathTransform;
import se.havochvatten.symphony.dto.BatchCalculationDto;
import se.havochvatten.symphony.dto.CalculationResultSliceDto;
import se.havochvatten.symphony.dto.CompoundComparisonSlice;
import se.havochvatten.symphony.dto.NormalizationType;
import se.havochvatten.symphony.entity.*;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.exception.SymphonyStandardSystemException;
import se.havochvatten.symphony.scenario.*;
import se.havochvatten.symphony.service.*;
import se.havochvatten.symphony.service.normalizer.NormalizerService;
import se.havochvatten.symphony.service.normalizer.RasterNormalizer;
import se.havochvatten.symphony.service.normalizer.StatsNormalizer;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.persistence.NoResultException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import java.awt.*;
import java.awt.geom.AffineTransform;
import java.awt.image.*;
import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.AccessDeniedException;
import java.security.Principal;
import java.util.*;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import static jakarta.ws.rs.core.Response.*;
import static se.havochvatten.symphony.util.CalculationUtil.*;
import static se.havochvatten.symphony.util.MetaDataUtil.*;
import static se.havochvatten.symphony.web.WebUtil.noPrincipalStr;

/**
 * Calculation REST API
 * <p>
 * This class handles request decoding, result color-mapping and image encoding.
 */

@Path("/calculation")
@Api(value = "/calculation")
public class CalculationREST {
    private static final Logger logger = Logger.getLogger(CalculationREST.class.getName());

    private static final String DATA_SOURCE_STR = "data.source.crs";
    private static final String DEFAULT_PROJECTION = "EPSG:3035";
    private static final String CUSTOM_EXTENT_HEADER = "SYM-Image-Extent";
    private static final String IMAGE_PNG = "image/png";

    private static final String FORBIDDEN_MESSAGE = "User not owner of scenario";


    @Inject
    private CalcService calcService;

    @Inject
    private NormalizerService normalizationFactory;

    @Inject
    private PropertiesService props;

    @Inject
    private ScenarioService scenarioService;

    @Inject
    BaselineVersionService baselineVersionService;

    private GridCoverage2D coverage;

    private ScenarioSnapshot scenario;

    private String sldProperty;

    private ReferencedEnvelope coverageEnvelope;

    private Rectangle coveragePixelDimension;

    private CoordinateReferenceSystem targetCRS;

    @POST
    @Path("/sum")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Computes cumulative impact sum")
    public CalculationResultSlice sum(@Context HttpServletRequest req,
                                      @Context UriInfo uriInfo,
                                      Integer scenarioId)
        throws Exception {
        if (scenarioId == null)
            throw new BadRequestException();
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException(noPrincipalStr);

        var persistedScenario = scenarioService.findById(scenarioId);
        if (!persistedScenario.getOwner().equals(req.getUserPrincipal().getName()))
            throw new ForbiddenException(FORBIDDEN_MESSAGE);

        var watch = new StopWatch();
        watch.start();
        logger.log(Level.INFO, () -> String.format("Performing %s calculation for %s ...", operationName(persistedScenario.getOperation()), persistedScenario.getName()));
        CalculationResult result = calcService.calculateScenarioImpact(persistedScenario, false);
        watch.stop();
        logger.log(Level.INFO, "DONE ({0} ms)", watch.getTime());

        return calcService.getCalculationSlice(result.getId());
    }
    @GET
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Get a specified calculation", response = CalculationResultSliceDto.class)
    public Response getCalculation(@Context HttpServletRequest req, @PathParam("id") int id) {
        try {
            var calculation = Optional.ofNullable(calcService.getCalculation(id)).orElseThrow(NotFoundException::new);
            if (calculation.getOwner().equals(req.getUserPrincipal().getName()))
                return ok(new CalculationResultSliceDto(calculation)).build();
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
    @ApiOperation(value = "Update name of an existing calculation", response = CalculationResultSliceDto.class)
    public Response updateName(@Context HttpServletRequest req, @PathParam("id") int id,
                               @QueryParam("action") String action,
                               String newName) {
        if (action.equals("update-name")) {
            var calculation = Optional.ofNullable(calcService.getCalculation(id)).orElseThrow(NotFoundException::new);
            if (calculation.getOwner().equals(req.getUserPrincipal().getName())
                    && !calculation.isBaselineCalculation()) {
                calculation.setCalculationName(newName);
                var updated = calcService.updateCalculation(calculation);
                return ok(new CalculationResultSliceDto(updated)).build();
            } else
                return status(Response.Status.UNAUTHORIZED).build();
        } else
            return ok(Response.Status.NOT_IMPLEMENTED).build();
    }

    // Endpoint added for conformant/intuitive API semantics.
    // Not presently used by the default UI app (/symphony-fe).
    @DELETE
    @ApiOperation(value = "Delete calculation result")
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response deleteCalculation(@Context HttpServletRequest req, @PathParam("id") int id) {
        return deleteCalculations(req, String.valueOf(id));
    }

    @DELETE
    @ApiOperation(value = "Delete calculation results")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response deleteCalculations(@Context HttpServletRequest req, @QueryParam("ids") String ids) {
        var principal = req.getUserPrincipal();
        if (principal == null)
            throw new NotAuthorizedException(noPrincipalStr);

        int[] idArray = WebUtil.intArrayParam(ids);

        try {
            for (int calcId : idArray) {
                var persistedCalculation = Optional.ofNullable(calcService.getCalculation(calcId)).orElseThrow(NotFoundException::new);
                if (!persistedCalculation.getOwner().equals(principal.getName())) {
                    throw new ForbiddenException(FORBIDDEN_MESSAGE);
                } else {
                    calcService.delete(req.getUserPrincipal(), calcId);
                }
            }
            return ok().build();
        } catch (NotFoundException nx) {
            return status(Response.Status.NOT_FOUND).build();
        } catch (ForbiddenException ax) {
            return status(Response.Status.FORBIDDEN).build();
        } catch (SymphonyStandardSystemException px) {
            return status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GET
    @Path("/all")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Gets all previous computations for the user")
    @RolesAllowed("GRP_SYMPHONY")
    public List<CalculationResultSlice> getAllCalculations(@Context HttpServletRequest req) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException(noPrincipalStr);
        else
            return calcService.findAllByUser(req.getUserPrincipal());
    }

    @GET
    @Path("/baseline/{baselineName}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get baseline BaseCalculations for baselineName",
            response = CalculationResultSliceDto.class, responseContainer = "List")
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
        CalculationResult calculationResult;
        calculationResult = Optional.ofNullable(calcService.getCalculation(id)).orElseThrow(NotFoundException::new);

        if (!hasAccess(calculationResult, req.getUserPrincipal()))
            return status(Response.Status.UNAUTHORIZED).build();

        if(calculationResult.getImagePNG() != null) {
            byte[] savedImage = calculationResult.getImagePNG();
            String extent = readMetaData(savedImage, "extent");

            if(extent != null) {
                return ok(savedImage, IMAGE_PNG)
                    .header(CUSTOM_EXTENT_HEADER, extent)
                    .build();
            }
        }

        this.scenario = calculationResult.getScenarioSnapshot();
        this.coverage = calculationResult.getCoverage() != null ?
            calculationResult.getCoverage() :
            calcService.recreateCoverageFromResult(this.scenario, calculationResult);

        this.sldProperty = "data.styles.result";
        this.coverageEnvelope = new ReferencedEnvelope(this.coverage.getEnvelope());
        this.coveragePixelDimension = this.coverage.getGridGeometry().toCanonical().getGridRange2D();
        // canonical needed if coverage is recreated
        this.targetCRS = this.coverage.getCoordinateReferenceSystem2D();

        crs = crs != null ? URLDecoder.decode(crs, StandardCharsets.UTF_8) :
                props.getProperty(DATA_SOURCE_STR, DEFAULT_PROJECTION);

        CoordinateReferenceSystem clientCRS =
            CRS.getAuthorityFactory(true).createCoordinateReferenceSystem(crs);
        MathTransform clientTransform =
            CRS.findMathTransform(coverage.getGridGeometry().getCoordinateReferenceSystem(), clientCRS);

        NormalizationType normalizationType = this.scenario.getNormalization().getType();
        RasterNormalizer normalizer = normalizationFactory.getNormalizer(normalizationType);

        int[] areas = scenario.getAreaMatrixMap().keySet().stream().sorted().mapToInt(i -> i).toArray();
        int areaIndex = 0;

        RenderedImage[] renderedImages = new RenderedImage[areas.length];

        for(int areaId : areas) {
            double normalizationValue = switch (normalizationType) {
                case USER_DEFINED ->
                    scenario.getNormalization().getUserDefinedValue();
                case STANDARD_DEVIATION ->
                    normalizer.apply(coverage, scenario.getNormalization().getStdDevMultiplier());
                case AREA, DOMAIN, PERCENTILE ->    // PERCENTILE doesn't happen
                    normalizer.apply(coverage, scenario.getNormalizationValue()[areaIndex]);
            };

            renderedImages[areaIndex] = renderAreaImage(scenario.getAreas().get(areaId).getFeature(), normalizationValue);
            ++areaIndex;
        }

        BufferedImage cimage = new BufferedImage(this.coveragePixelDimension.width, this.coveragePixelDimension.height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = cimage.createGraphics();
        AffineTransform at = new AffineTransform();
        for(RenderedImage image : renderedImages) {
            g2d.drawRenderedImage(image, at);
        }

        String extent = WebUtil.createExtent(JTS.transform(this.coverageEnvelope, clientTransform)).toString();

        ByteArrayOutputStream baos = WebUtil.encode(cimage, "png");
        baos.flush();

        calculationResult.setImagePNG(
            addMetaData(cimage, cimage.getColorModel(), cimage.getSampleModel(), "extent", extent)
        );

        calcService.updateCalculation(calculationResult);

        return ok(baos.toByteArray(), IMAGE_PNG)
            .header(CUSTOM_EXTENT_HEADER, WebUtil.createExtent(JTS.transform(this.coverageEnvelope, clientTransform)).toString())
            .build();
    }

    private RenderedImage renderAreaImage(
        SimpleFeature areaFeatureToRender,
        double normalizationValue) throws Exception {

        MathTransform mt = CRS.findMathTransform(areaFeatureToRender.getBounds().getCoordinateReferenceSystem(), this.targetCRS);
        // "SLD" apparently needs to be instantiated anew for each render
        // maybe to do with JAI op threading?
        StyledLayerDescriptor sld =
            WebUtil.getSLD(CalculationREST.class.getClassLoader().getResourceAsStream(props.getProperty(this.sldProperty)));
        GridCoverage2D croppedArea = cropToScenarioArea(areaFeatureToRender, mt);

        if(croppedArea == null)
            return null;

        return WebUtil.renderNormalized(croppedArea, targetCRS,
                        this.coverageEnvelope, this.coveragePixelDimension,
                        sld, normalizationValue);
    }

    public record CompoundComparisonRequest(int[] ids, String name) {}

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
                                       @PathParam("a") int baseId, @PathParam("b") int scenarioId,
                                       @QueryParam("max") Integer maxValue,
                                       @QueryParam("dynamic") boolean dynamic, @QueryParam("crs") String crs)
            throws Exception {
        crs = crs != null ? URLDecoder.decode(crs, StandardCharsets.UTF_8) :
                props.getProperty(DATA_SOURCE_STR, DEFAULT_PROJECTION);
        maxValue = maxValue != null ? maxValue : 45;

        try {
            var diff = getDiffCoverageFromCalcIds(calcService, req, baseId, scenarioId);
            return projectedPNGImageResponse(diff, crs, null, dynamic, maxValue);
        } catch (AccessDeniedException ax) {
            return status(Response.Status.UNAUTHORIZED).build();
        } catch (SymphonyStandardAppException sx) {
            return status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GET
    @Path("/diff/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces({"image/png"})
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Computes the difference between a calculation and an implicit baseline", response = byte[].class)
    public Response getDifferenceImage(@Context HttpServletRequest req,
                                       @PathParam("id") int scenarioId,
                                       @QueryParam("max") Integer maxValue,
                                       @DefaultValue("false") @QueryParam("reverse") boolean reverse,
                                       @QueryParam("dynamic") boolean dynamic, @QueryParam("crs") String crs)
            throws Exception {
        crs = crs != null ? URLDecoder.decode(crs, StandardCharsets.UTF_8) :
                props.getProperty(DATA_SOURCE_STR, DEFAULT_PROJECTION);
        maxValue = maxValue != null ? maxValue : 45;

        try {
            var diff = getImplicitDiffCoverageFromCalcId(calcService, req, scenarioId, reverse);
            return projectedPNGImageResponse(diff, crs, null, dynamic, maxValue);
        } catch (AccessDeniedException ax) {
            return status(Response.Status.UNAUTHORIZED).build();
        } catch (SymphonyStandardAppException sx) {
            return status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @POST
    @Path("/batch")
    @Consumes(MediaType.TEXT_PLAIN)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Queues batch run of scenario calculations", response = BatchCalculationDto.class)
    public BatchCalculationDto queueBatchCalculation(@Context HttpServletRequest req, String ids) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException(noPrincipalStr);

        int[] idArray = WebUtil.intArrayParam(ids);
        Map<Integer, String> scenarioNames = new HashMap<>();

        for(int id : idArray) {
            var persistedScenario = scenarioService.findById(id);
            if (!persistedScenario.getOwner().equals(req.getUserPrincipal().getName()))
                throw new ForbiddenException(FORBIDDEN_MESSAGE);
            scenarioNames.put(id, persistedScenario.getName());
        }

        BatchCalculation queuedBatchCalculation =
            calcService.queueBatchCalculation(idArray, req.getUserPrincipal().getName(), null);
        logger.log(Level.INFO, "Queuing batch calculation for ids: {0}", Arrays.toString(idArray));

        return new BatchCalculationDto(queuedBatchCalculation, scenarioNames);
    }

    @POST
    @Path("/batch/areas/{scenarioId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Queues batch run of scenario area calculations for the given scenario", response = BatchCalculationDto.class)
    public BatchCalculationDto queueAreaBatchCalculation(@Context HttpServletRequest req, @PathParam("scenarioId") Integer id,
                                                         ScenarioSplitOptions options) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException(noPrincipalStr);

        Scenario persistedScenario = null;

        Map<Integer, String> areaNames = new HashMap<>();

        if(id != null) {
            persistedScenario = scenarioService.findById(id);
            if (!persistedScenario.getOwner().equals(req.getUserPrincipal().getName()))
                throw new ForbiddenException(FORBIDDEN_MESSAGE);
        }

        if (persistedScenario == null)
            throw new BadRequestException();

        for(ScenarioArea area : persistedScenario.getAreas()) {
            areaNames.put(area.getId(), area.getName());
        }

        int[] idArray = areaNames.keySet().stream().mapToInt(i -> i).toArray();

        BatchCalculation queuedBatchCalculation =
            calcService.queueBatchCalculation(idArray, req.getUserPrincipal().getName(), options);
        logger.log(Level.INFO, "Queuing batch area calculation for ids: {0}", Arrays.toString(idArray));

        return new BatchCalculationDto(queuedBatchCalculation, areaNames);
    }

    @POST
    @Path("/batch/{id}/cancel")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Cancels batch calculation process")
    public Response cancelBatchCalculation(@Context HttpServletRequest req, @PathParam("id") int id) {
        var principal = req.getUserPrincipal();
        if (principal == null)
            throw new NotAuthorizedException(noPrincipalStr);

        try {
            calcService.cancelBatchCalculation(req.getUserPrincipal(), id);
            logger.log(Level.INFO, "Cancelling batch calculation run, id: {0}", id);
            return ok().build();
        } catch (NotFoundException nx) {
            return status(Response.Status.NOT_FOUND).build();
        } catch (NotAuthorizedException ax) {
            return status(Response.Status.UNAUTHORIZED).build();
        }
    }

    @DELETE
    @Path("/batch/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Deletes batch calculation process entry")
    public Response deleteBatchCalculation(@Context HttpServletRequest req, @PathParam("id") int id) {
        var principal = req.getUserPrincipal();
        if (principal == null)
            throw new NotAuthorizedException(noPrincipalStr);

        try {
            calcService.deleteBatchCalculationEntry(req.getUserPrincipal(), id);
            return ok().build();
        } catch (NotFoundException nx) {
            return status(Response.Status.NOT_FOUND).build();
        } catch (NotAuthorizedException ax) {
            return status(Response.Status.UNAUTHORIZED).build();
        } catch (SymphonyStandardAppException px) {
            return status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GET
    @Path("/matching/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Returns a list of calculation matching the ROI of specified calculation")
    public List<CalculationResultSliceDto> getCalculationsWithMatchingGeometry(@Context HttpServletRequest req,
                                                                               @PathParam("id") int id) {
        var base = Optional.ofNullable(calcService.getCalculation(id)).orElseThrow(NotFoundException::new);
        verifyAccessToCalculation(base, req.getUserPrincipal());

        return calcService.findAllMatchingCalculationsByUser(req.getUserPrincipal(), base);
    }

    @GET
    @Path("/last-mask")
    @Produces("image/png")
    @RolesAllowed("GRP_SYMPHONY_ADMIN")
    @ApiOperation(value = "Returns calculation mask for the last calculation (for debugging purposes)")
    public Response getMask(@Context HttpServletRequest req) {
        var session = req.getSession(false);
        if (session == null)
            return status(Response.Status.NO_CONTENT).build();
        return ok(session.getAttribute("mask"), IMAGE_PNG).build();
    }

    @POST
    @Path("/multi-comparison/{baselineName}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.TEXT_PLAIN)
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Computes compound difference matrix (relative to an implicit baseline) for multiple calculations.\n" +
                          "Returns entity PK id (if successful)", response = Integer.class)
    public Response multiComparison(@Context HttpServletRequest req, @PathParam("baselineName") String baselineName,
                                    @Context UriInfo uriInfo, CompoundComparisonRequest request)
            throws SymphonyStandardAppException, SymphonyStandardSystemException {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException(noPrincipalStr);

        var principal = req.getUserPrincipal();

        try {
            BaselineVersion baseline = baselineVersionService.getVersionByName(baselineName);
            Integer createdCompoundCmpId = calcService.createCompoundComparison(request.ids, request.name, principal, baseline);
            URI uri = uriInfo.getAbsolutePathBuilder().path(String.valueOf(createdCompoundCmpId)).build();

            return created(uri).build();
        } catch (SymphonyStandardAppException | SymphonyStandardSystemException sx) {
            return status(Response.Status.INTERNAL_SERVER_ERROR).build();
        } catch (NotAuthorizedException ax) {
            return status(Response.Status.UNAUTHORIZED).build();
        }
    }

    @GET
    @Path("/multi-comparison/all")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Returns all compound comparisons for the given baseline", response = CompoundComparisonSlice.class, responseContainer = "List")
    public Response getCompoundComparisons(@Context HttpServletRequest req) {

        Principal principal = req.getUserPrincipal();

        if(principal == null)
            return status(Response.Status.UNAUTHORIZED).build();

        try {
            List<CompoundComparisonSlice> comparisons = calcService.getCompoundComparisons(principal);
            return ok(comparisons).build();
        } catch (SymphonyStandardSystemException sx) {
            return status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DELETE
    @Path("/multi-comparison/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Delete compound comparison with the given id")
    public Response deleteCompoundComparison(@Context HttpServletRequest req, @PathParam("id") int id) {
        return deleteCompoundComparisons(req, String.valueOf(id));
    }

    @DELETE
    @Path("/multi-comparison/")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Delete compound comparisons with the given ids " +
                         "(expected as comma separated list provided as query parameter 'ids=')")
    public Response deleteCompoundComparisons(@Context HttpServletRequest req, @QueryParam("ids") String ids) {
        var principal = req.getUserPrincipal();
        if (principal == null)
            return status(Response.Status.UNAUTHORIZED).build();

        try {
            int[] idArray = WebUtil.intArrayParam(ids);
            for(int id : idArray) {
                if (!calcService.deleteCompoundComparison(principal, id)) {
                    return status(Response.Status.NOT_FOUND).build();
                }
            }
            return Response.noContent().build();
        } catch (SymphonyStandardSystemException sx) {
            return status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }


    public static GridCoverage2D getDiffCoverageFromCalcIds(CalcService calcService, HttpServletRequest req, int baseId, int relativeId) throws SymphonyStandardAppException {
        logger.log(Level.INFO, () -> String.format("Diffing base line calculations %d against calculation %d", baseId, relativeId));

        var base = Optional.ofNullable(calcService.getCalculation(baseId)).orElseThrow(NotFoundException::new);
        var scenario = Optional.ofNullable(calcService.getCalculation(relativeId)).orElseThrow(NotFoundException::new);

        if (!hasAccess(base, req.getUserPrincipal()) || !hasAccess(scenario, req.getUserPrincipal()))
            throw new NotAuthorizedException("Unauthorized");

        try {
            GridCoverage2D baseCoverage = base.getCoverage(),
                           relativeCoverage = scenario.getCoverage();

            if (baseCoverage == null) {
                baseCoverage = calcService.recreateCoverageFromResult(base.getScenarioSnapshot(), base);
            }

            if (relativeCoverage == null) {
                relativeCoverage = calcService.recreateCoverageFromResult(scenario.getScenarioSnapshot(), scenario);
            }

            return calcService.relativeDifference(baseCoverage, relativeCoverage);
        } catch (Exception e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.OTHER_ERROR);
        }
        // TODO Store coverage in user session? (and recalc if necessary?)
    }

    public static GridCoverage2D getImplicitDiffCoverageFromCalcId(
        CalcService calcService, HttpServletRequest req, int relativeId, boolean reverse)
        throws SymphonyStandardAppException {
        var scenario = Optional.ofNullable(calcService.getCalculation(relativeId)).orElseThrow(NotFoundException::new);

        if (!hasAccess(scenario, req.getUserPrincipal()))
            throw new NotAuthorizedException("Unauthorized");

        try {
            GridCoverage2D relativeCoverage = scenario.getCoverage();

            if (relativeCoverage == null) {
                relativeCoverage = calcService.recreateCoverageFromResult(scenario.getScenarioSnapshot(), scenario);
            }
            if(!reverse) {
                return calcService.relativeDifference(calcService.getImplicitBaselineCoverage(scenario), relativeCoverage);
            } else {
                return calcService.relativeDifference(relativeCoverage, calcService.getImplicitBaselineCoverage(scenario));
            }
        } catch (Exception e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.OTHER_ERROR);
        }
    }

    public GridCoverage2D cropToScenarioArea(SimpleFeature areaFeature, MathTransform transform)
        throws MismatchedDimensionException {

        RenderedImage canvas = this.coverage.getRenderedImage();

        // Weirdly, we cannot instantiate a BufferedImage directly since it's encapsulated to java.awt,
        // making it inaccessible to JAI operations.
        // new BufferedImage(this.coveragePixelDimension.width, this.coveragePixelDimension.height,
        // BufferedImage.TYPE_INT_ARGB);   <- triggers error at runtime

        Geometry intersection = null;
        try {
            intersection = IntersectUtils.intersection(
                JTS.transform((Geometry) areaFeature.getDefaultGeometry(), transform),
                this.scenario.getGeometry().getEnvelope());
        } catch (Exception e) {/* ignore */}

        if(!(intersection instanceof GeometryCollection)) {
            intersection = IntersectUtils.unrollGeometries(intersection);
        }

        GridCoverageFactory gridCoverageFactory = new GridCoverageFactory();
        Coverage featureCoverage = gridCoverageFactory.create("Raster", canvas, this.coverageEnvelope);

        CoverageProcessor processor = new CoverageProcessor();
        ParameterValueGroup params = processor.getOperation("CoverageCrop").getParameters();
        params.parameter("Source").setValue(featureCoverage);
        params.parameter("ROI").setValue(intersection);
        params.parameter("ForceMosaic").setValue(true);

        return (GridCoverage2D) processor.doOperation(params);
    }

    private Response projectedPNGImageResponse(GridCoverage2D coverage, String crs, Double normalizationValue,
                                               boolean dynamicComparativeScale, int maxPercentage) throws Exception {
        Envelope dataEnvelope = new ReferencedEnvelope(coverage.getEnvelope());
        CoordinateReferenceSystem imageTargetCRS;
        Envelope targetEnvelope;
        RenderedImage image;
        double dynamicMax = 0;

        if (crs == null) {
            imageTargetCRS = coverage.getCoordinateReferenceSystem2D();
            targetEnvelope = dataEnvelope;
        } else {
            imageTargetCRS = CRS.getAuthorityFactory(true).createCoordinateReferenceSystem(crs);
            MathTransform transform = CRS.findMathTransform(
                coverage.getGridGeometry().getCoordinateReferenceSystem(), imageTargetCRS);
            targetEnvelope = JTS.transform(dataEnvelope, transform);
        }

        if(normalizationValue != null) {
            image = WebUtil.renderNormalized(coverage, imageTargetCRS, targetEnvelope,
                WebUtil.getSLD(CalculationREST.class.getClassLoader().getResourceAsStream(
                    props.getProperty("data.styles.result"))), normalizationValue);
        } else {
            // Comparative image
            var sld =
                WebUtil.getSLD(CalculationREST.class.getClassLoader().getResourceAsStream(
                        props.getProperty("data.styles.comparison")));
            // "Dynamic" color maxima
            if(dynamicComparativeScale || maxPercentage == 0) {
                double[] extrema = StatsNormalizer.getExtrema(coverage, normalizationFactory.getOperations());

                dynamicMax = Math.max(Math.abs(extrema[0]), Math.abs(extrema[1]));

                // Edge case: both extrema may be 0 (no difference);
                // arbitrarily set 'tiny' dynamic maximum (we'll go with 0.01%, truncates to 0% in report)
                // to provide a "mappable" range for the color scale
                dynamicMax = dynamicMax == 0 ? 0.0001 : dynamicMax;

                image = WebUtil.renderDynamicComparison(coverage, imageTargetCRS, targetEnvelope, sld, dynamicMax);
            } else {
                image = WebUtil.renderDynamicComparison(coverage, imageTargetCRS, targetEnvelope, sld, maxPercentage / 100.0);
            }
        }

        logger.info("Encoding result in PNG format...");
        var baos = WebUtil.encode(image, "png");
        logger.log(Level.INFO, "DONE ({0} bytes)", baos.size());

        // Revving caching strategy
        var cc = new CacheControl();
        cc.setMaxAge(WebUtil.ONE_YEAR_IN_SECONDS);

        Response response = ok(baos.toByteArray(), IMAGE_PNG)
            .header(CUSTOM_EXTENT_HEADER, WebUtil.createExtent(targetEnvelope).toString())
            .cacheControl(cc)
            .build();

        if (dynamicComparativeScale) {
            try (Formatter fmt = new Formatter(Locale.US)) {
                response.getHeaders().add("SYM-Dynamic-Max", fmt.format("%.3f", dynamicMax));
            }
        }

        return response;
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
