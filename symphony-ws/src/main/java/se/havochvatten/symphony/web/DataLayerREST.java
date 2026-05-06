package se.havochvatten.symphony.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ejb.EJB;
import jakarta.json.JsonArray;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.CacheControl;
import jakarta.ws.rs.core.Response;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.GridGeometry2D;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.referencing.CRS;
import org.locationtech.jts.geom.Envelope;
import org.opengis.referencing.crs.CRSAuthorityFactory;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.MathTransform;
import se.havochvatten.symphony.dto.SummaryModelConfig.SummaryModelDescription;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.service.BaselineVersionService;
import se.havochvatten.symphony.service.DataLayerService;
import se.havochvatten.symphony.service.SummaryModelConfigService;
import se.havochvatten.symphony.service.PropertiesService;

import java.awt.image.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import static jakarta.ws.rs.core.Response.ok;
import static se.havochvatten.symphony.util.MetaDataUtil.addMetaData;
import static se.havochvatten.symphony.util.MetaDataUtil.readMetaData;

@Path("/datalayer")
@Tag(name = "/datalayer")
public class DataLayerREST {
    private static final Logger logger = Logger.getLogger(DataLayerREST.class.getName());

    @EJB
    private PropertiesService props;

    @EJB
    private DataLayerService data;

    @EJB
    BaselineVersionService baselineVersionService;

    @EJB
    private SummaryModelConfigService summaryModelConfigService;

    private ImageCache cache;

    @PostConstruct
    void setup() {
        var cacheDir = props.getProperty("data.cache_dir");
        if (cacheDir != null) cache = new ImageCache(cacheDir);
    }

    @GET
    @Path("/{type}/{id}/{baselineName}")
    @Produces({"image/png"})
    @RolesAllowed("GRP_SYMPHONY")
    @Operation(summary = "Returns data layer image")
    public Response getLayerData(@PathParam("type") String type, @PathParam("id") int bandNo, @PathParam("baselineName") String baselineName, @QueryParam("crs") String crs) throws Exception {
        logger.log(Level.INFO, () -> String.format("Getting layer data of type %s for bandNo=%d", type, bandNo));

        BaselineVersion baselineVersion = baselineVersionService.getVersionByName(baselineName);
        var layerType = LayerType.valueOf(type.toUpperCase());

        java.nio.file.Path cacheKey = java.nio.file.Path.of(baselineName, type).resolve(bandNo + ".png");
        if (cache != null && cache.containsKey(cacheKey)) {
            byte[] bytes = cache.get(cacheKey);
            String extent = readMetaData(bytes, "extent");
            return ok(cache.get(cacheKey), "image/png").header("SYM-Image-Extent", (extent == null ? "" : extent)).build();
        }

        GridCoverage2D coverage = data.getDataLayer(layerType, baselineVersion.getId(), bandNo);
        return buildImageResponse(coverage, layerType, baselineName, type, String.valueOf(bandNo), crs);
    }

    @GET
    @Path("/{baselineName}/{type}/model/{model}")
    @Produces({"image/png"})
    @RolesAllowed("GRP_SYMPHONY")
    @Operation(summary = "Returns summary model image")
    public Response getSummaryModel(@PathParam("baselineName") String baselineName, @PathParam("type") String type, @PathParam("model") String model, @QueryParam("crs") String crs) throws Exception {
        logger.log(Level.INFO, () -> String.format("Getting summary model of type %s for model=%s", type, model));

        BaselineVersion baselineVersion = baselineVersionService.getVersionByName(baselineName);
        var layerType = LayerType.valueOf(type.toUpperCase());

        java.nio.file.Path cacheKey = java.nio.file.Path.of(baselineName, type, "model").resolve(model + ".png");
        if (cache != null && cache.containsKey(cacheKey)) {
            byte[] bytes = cache.get(cacheKey);
            String extent = readMetaData(bytes, "extent");
            return ok(bytes, "image/png").header("SYM-Image-Extent", (extent == null ? "" : extent)).build();
        }
        GridCoverage2D coverage = data.getSummaryModel(layerType, baselineVersion, model);
        return buildImageResponse(coverage, layerType, baselineVersion.getName(), type + "/model", model, crs);
    }

    @GET
    @Path("/{baselineName}/{type}/model/{model}/description")
    @Produces(jakarta.ws.rs.core.MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @Operation(summary = "Dynamic mathematical description of summary model (for popup)")
    public Response getModelDescription(
        @PathParam("baselineName") String baselineName,
        @PathParam("type") String type,
        @PathParam("model") String model,
        @QueryParam("locale") @DefaultValue("sv") String locale) throws SymphonyStandardAppException {

        BaselineVersion bv = baselineVersionService.getVersionByName(baselineName);
        var layerType = LayerType.valueOf(type.toUpperCase());

        SummaryModelDescription desc = summaryModelConfigService.getModelDescription(baselineName, layerType, model, bv.getId(), locale);

        return ok(desc).build();
    }

    @GET
    @Path("/{baselineName}/{type}/models")
    @Produces(jakarta.ws.rs.core.MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    @Operation(summary = "Returns list of available summary model keys for the given type and baseline")
    public Response getAvailableSummaryModels(@PathParam("baselineName") String baselineName, @PathParam("type") String type) {
        var layerType = LayerType.valueOf(type.toUpperCase());
        List<String> models = summaryModelConfigService.getAvailableModels(baselineName, layerType);
        return ok(models).build();
    }

    private Response buildImageResponse(GridCoverage2D coverage, LayerType layerType, String baselineName, String cacheTypePath, String cacheLeaf, String crs) throws Exception {
        Envelope dataEnvelope = new ReferencedEnvelope(coverage.getEnvelope());
        crs = crs != null ? URLDecoder.decode(crs, StandardCharsets.UTF_8) : "EPSG:3035";

        CRSAuthorityFactory factory = CRS.getAuthorityFactory(true);
        CoordinateReferenceSystem targetCRS = factory.createCoordinateReferenceSystem(crs);
        GridGeometry2D gridGeometry = coverage.getGridGeometry();
        MathTransform transform = CRS.findMathTransform(gridGeometry.getCoordinateReferenceSystem(), targetCRS);
        Envelope targetEnvelope = JTS.transform(dataEnvelope, null, transform, 10);

        RenderedImage img = WebUtil.render(coverage, targetCRS, targetEnvelope, WebUtil.getSLD(DataLayerREST.class.getClassLoader().getResourceAsStream(props.getProperty("data.styles." + layerType.toString().toLowerCase()))));

        byte[] samples = (byte[]) (img.getData().getDataElements(img.getMinX(), img.getMinY(), img.getWidth(), img.getHeight(), null));
        DataBuffer buf = new DataBufferByte(samples, samples.length);
        SampleModel sm = img.getSampleModel().createCompatibleSampleModel(img.getWidth(), img.getHeight());
        ColorModel cm = img.getColorModel();
        var raster = Raster.createWritableRaster(sm, buf, null);
        var image = new BufferedImage(cm, raster, false, null);
        JsonArray extent = WebUtil.createExtent(targetEnvelope);

        byte[] bs = addMetaData(image, cm, sm, "extent", extent.toString());
        if (cache != null) {
            java.nio.file.Path cacheKey = java.nio.file.Path.of(baselineName, cacheTypePath).resolve(cacheLeaf + ".png");
            cache.put(cacheKey, bs);
        }

        var cc = new CacheControl();
        cc.setMaxAge(WebUtil.ONE_YEAR_IN_SECONDS);

        return ok(bs, "image/png").header("SYM-Image-Extent", extent.toString()).cacheControl(cc).build();
    }
}
