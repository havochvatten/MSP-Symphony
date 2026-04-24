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
import org.apache.commons.lang3.time.StopWatch;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.GridGeometry2D;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.referencing.CRS;
import org.geotools.styling.StyledLayerDescriptor;
import org.locationtech.jts.geom.Envelope;
import org.opengis.referencing.crs.CRSAuthorityFactory;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.MathTransform;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.service.BaselineVersionService;
import se.havochvatten.symphony.service.DataLayerService;
import se.havochvatten.symphony.service.PropertiesService;

import javax.imageio.ImageIO;
import java.awt.image.RenderedImage;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import static jakarta.ws.rs.core.Response.ok;
import static se.havochvatten.symphony.util.MetaDataUtil.addMetaData;
import static se.havochvatten.symphony.util.MetaDataUtil.readMetaData;

@Path("/datalayer")
@Tag(name = "/datalayer")
public class DataLayerREST {
    private static final Logger logger = Logger.getLogger(DataLayerREST.class.getName());
    private static final String DEFAULT_CRS = "EPSG:3035";

    @EJB
    private PropertiesService props;

    @EJB
    private DataLayerService data;

    @EJB
    BaselineVersionService baselineVersionService;

    private ImageCache cache;
    private final Map<String, CoordinateReferenceSystem> targetCrsCache = new ConcurrentHashMap<>();
    private final Map<LayerType, byte[]> styleBytesCache = new ConcurrentHashMap<>();
    private final Map<LayerType, StyledLayerDescriptor> styleCache = new ConcurrentHashMap<>();

    @PostConstruct
    void setup() {
        var cacheDir = props.getProperty("data.cache_dir");
        if (cacheDir != null) cache = new ImageCache(cacheDir);

        String imageIoUseCache = props.getProperty("data.imageio.useCache");
        if (imageIoUseCache != null && !imageIoUseCache.isBlank()) {
            boolean useCache = Boolean.parseBoolean(imageIoUseCache);
            ImageIO.setUseCache(useCache);
            logger.log(Level.INFO, () -> String.format("[HEATMAP_DEBUG] ImageIO disk cache configured: useCache=%s", useCache));
        }
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
            return ok(bytes, "image/png").header("SYM-Image-Extent", (extent == null ? "" : extent)).build();
        }

        GridCoverage2D coverage = data.getDataLayer(layerType, baselineVersion.getId(), bandNo);
        try {
            return buildImageResponse(coverage, layerType, baselineName, type, String.valueOf(bandNo), crs);
        } finally {
            coverage.dispose(false);
        }
    }

    @GET
    @Path("/{type}/model/{model}/{baselineName}")
    @Produces({"image/png"})
    @RolesAllowed("GRP_SYMPHONY")
    @Operation(summary = "Returns heatmap model image")
    public Response getHeatmapLayer(@PathParam("type") String type, @PathParam("model") String model, @PathParam("baselineName") String baselineName, @QueryParam("crs") String crs) throws Exception {
        var totalWatch = StopWatch.createStarted();
        logger.log(Level.INFO, () -> String.format("Getting heatmap model of type %s for model=%s", type, model));

        BaselineVersion baselineVersion = baselineVersionService.getVersionByName(baselineName);
        var layerType = LayerType.valueOf(type.toUpperCase());

        java.nio.file.Path cacheKey = java.nio.file.Path.of(baselineName, type, "model").resolve(model + ".png");
        if (cache != null && cache.containsKey(cacheKey)) {
            logger.log(Level.INFO, () -> String.format("[HEATMAP_DEBUG] Cache hit for type=%s model=%s baseline=%s (%d ms)", type, model, baselineName, totalWatch.getTime()));
            var cacheReadWatch = StopWatch.createStarted();
            byte[] bytes = cache.get(cacheKey);
            logger.log(Level.INFO, () -> String.format("[HEATMAP_DEBUG] Cache read finished for type=%s model=%s baseline=%s bytes=%d (%d ms)", type, model, baselineName, bytes == null ? 0 : bytes.length, cacheReadWatch.getTime()));
            String extent = readMetaData(bytes, "extent");
            logger.log(Level.INFO, () -> String.format("[HEATMAP_DEBUG] Returning cache response for type=%s model=%s baseline=%s total=%d ms", type, model, baselineName, totalWatch.getTime()));
            return ok(bytes, "image/png").header("SYM-Image-Extent", (extent == null ? "" : extent)).build();
        }
        logger.log(Level.INFO, () -> String.format("[HEATMAP_DEBUG] Cache miss for type=%s model=%s baseline=%s (%d ms)", type, model, baselineName, totalWatch.getTime()));

        GridCoverage2D coverage = data.getHeatmapLayer(layerType, baselineVersion.getId(), model);
        logger.log(Level.INFO, () -> String.format("[HEATMAP_DEBUG] Heatmap coverage ready for type=%s model=%s (%d ms)", type, model, totalWatch.getTime()));
        try {
            return buildImageResponse(coverage, layerType, baselineName, type + "/model", model, crs);
        } finally {
            coverage.dispose(false);
        }
    }

    private Response buildImageResponse(GridCoverage2D coverage, LayerType layerType, String baselineName, String cacheTypePath, String cacheLeaf, String crs) throws Exception {
        var totalWatch = StopWatch.createStarted();

        Envelope dataEnvelope = new ReferencedEnvelope(coverage.getEnvelope());
        CoordinateReferenceSystem targetCRS;
        Envelope targetEnvelope;
        crs = crs != null ? URLDecoder.decode(crs, StandardCharsets.UTF_8) : DEFAULT_CRS;

        targetCRS = getTargetCrs(crs);
        GridGeometry2D gridGeometry = coverage.getGridGeometry();
        MathTransform transform = CRS.findMathTransform(gridGeometry.getCoordinateReferenceSystem(), targetCRS);
        targetEnvelope = JTS.transform(dataEnvelope, null, transform, 10);
        logger.log(Level.INFO, () -> String.format("[HEATMAP_DEBUG] Envelope transform finished for layerType=%s cachePath=%s/%s (%d ms)", layerType, cacheTypePath, cacheLeaf, totalWatch.getTime()));

        var renderWatch = StopWatch.createStarted();
        RenderedImage img = WebUtil.render(coverage, targetCRS, targetEnvelope, getStyle(layerType));
        logger.log(Level.INFO, () -> String.format("[HEATMAP_DEBUG] Render finished for layerType=%s cachePath=%s/%s (%d ms)", layerType, cacheTypePath, cacheLeaf, renderWatch.getTime()));

        var imageConversionWatch = StopWatch.createStarted();
        logger.log(Level.INFO, () -> String.format("[HEATMAP_DEBUG] Image conversion finished for layerType=%s cachePath=%s/%s total=%d ms (getData=%d ms, extractSamples=%d ms, wrapImage=%d ms)",
            layerType, cacheTypePath, cacheLeaf, imageConversionWatch.getTime(), 0L, 0L, 0L));

        JsonArray extent = WebUtil.createExtent(targetEnvelope);

        var encodeWatch = StopWatch.createStarted();
        byte[] bs = addMetaData(img, "extent", extent.toString());
        logger.log(Level.INFO, () -> String.format("[HEATMAP_DEBUG] PNG encoding+metadata finished for layerType=%s cachePath=%s/%s (%d ms)", layerType, cacheTypePath, cacheLeaf, encodeWatch.getTime()));

        if (cache != null) {
            var cacheWriteWatch = StopWatch.createStarted();
            java.nio.file.Path cacheKey = java.nio.file.Path.of(baselineName, cacheTypePath).resolve(cacheLeaf + ".png");
            cache.put(cacheKey, bs);
            logger.log(Level.INFO, () -> String.format("[HEATMAP_DEBUG] Cache write finished for key=%s (%d ms)", cacheKey, cacheWriteWatch.getTime()));
        }

        var cc = new CacheControl();
        cc.setMaxAge(WebUtil.ONE_YEAR_IN_SECONDS);

        logger.log(Level.INFO, () -> String.format("[HEATMAP_DEBUG] Response built for layerType=%s cachePath=%s/%s total=%d ms", layerType, cacheTypePath, cacheLeaf, totalWatch.getTime()));
        return ok(bs, "image/png").header("SYM-Image-Extent", extent.toString()).cacheControl(cc).build();
    }

    private CoordinateReferenceSystem getTargetCrs(String crsCode) throws Exception {
        CoordinateReferenceSystem cached = targetCrsCache.get(crsCode);
        if (cached != null) {
            return cached;
        }

        CRSAuthorityFactory factory = CRS.getAuthorityFactory(true);
        CoordinateReferenceSystem created = factory.createCoordinateReferenceSystem(crsCode);
        targetCrsCache.put(crsCode, created);
        return created;
    }

    private StyledLayerDescriptor getStyle(LayerType layerType) throws Exception {
        StyledLayerDescriptor cachedStyle = styleCache.get(layerType);
        if (cachedStyle != null) {
            return cachedStyle;
        }

        byte[] styleBytes = styleBytesCache.get(layerType);
        if (styleBytes == null) {
            String propertyKey = "data.styles." + layerType.toString().toLowerCase();
            String stylePath = props.getProperty(propertyKey);
            if (stylePath == null || stylePath.isBlank()) {
                throw new IllegalStateException("Missing style property: " + propertyKey);
            }
            try (InputStream stream = DataLayerREST.class.getClassLoader().getResourceAsStream(stylePath)) {
                if (stream == null) {
                    throw new IllegalStateException("Style resource not found: " + stylePath);
                }
                styleBytes = stream.readAllBytes();
            }
            styleBytesCache.put(layerType, styleBytes);
        }

        StyledLayerDescriptor parsed = WebUtil.getSLD(new ByteArrayInputStream(styleBytes));
        styleCache.put(layerType, parsed);
        return parsed;
    }
}
