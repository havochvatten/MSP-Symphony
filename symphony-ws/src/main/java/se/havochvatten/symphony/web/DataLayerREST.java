package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.GridGeometry2D;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.referencing.CRS;
import org.locationtech.jts.geom.Envelope;
import org.opengis.referencing.crs.CRSAuthorityFactory;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.MathTransform;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.service.BaselineVersionService;
import se.havochvatten.symphony.service.DataLayerService;
import se.havochvatten.symphony.service.PropertiesService;

import javax.annotation.PostConstruct;
import javax.annotation.security.RolesAllowed;
import javax.ejb.EJB;
import javax.json.JsonArray;
import javax.ws.rs.*;
import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.Response;
import java.awt.image.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.logging.Logger;

import static javax.ws.rs.core.Response.ok;

@Path("/datalayer")
@Api(value = "/datalayer")
public class DataLayerREST {
    private static final Logger logger = Logger.getLogger(DataLayerREST.class.getName());

    @EJB
    private PropertiesService props;

    @EJB
    private DataLayerService data;

    @EJB
    BaselineVersionService baselineVersionService;

    private ImageCache cache;

    @PostConstruct
    void setup() {
        var cacheDir = props.getProperty("data.cache_dir");
        if (cacheDir != null)
            cache = new ImageCache(cacheDir);
    }

    @GET
    @Path("/{type}/{id}/{baselineName}")
    @Produces({"image/png"}) // make JPEG and/or WebP available?
    @RolesAllowed("GRP_SYMPHONY")
    @ApiOperation(value = "Returns calculation result image")
    public Response getLayerData(@PathParam("type") String type,
                                 @PathParam("id") int bandNo,
                                 @PathParam("baselineName") String baselineName,
                                 @QueryParam("crs") String crs)
            throws Exception {
        logger.info("Getting layer data of type " + type + " for bandNo=" + bandNo);

        BaselineVersion baselineVersion = baselineVersionService.getVersionByName(baselineName);

        var layerType = LayerType.valueOf(type.toUpperCase());

        java.nio.file.Path cacheKey = java.nio.file.Path.of(baselineName, type).resolve(bandNo + ".png");
        if (cache != null && cache.containsKey(cacheKey)) { // TODO: check CRS
            byte[] bytes = cache.get(cacheKey);
            String extent = DataLayerService.readMetaData(bytes, "extent");
            return ok(cache.get(cacheKey), "image/png")
                    .header("SYM-Image-Extent", (extent == null ? "" : extent))
                    .build();
        } else {
            GridCoverage2D coverage = data.getDataLayer(layerType, baselineVersion.getId(), bandNo);

            Envelope dataEnvelope = new ReferencedEnvelope(coverage.getEnvelope());
            CoordinateReferenceSystem targetCRS;
            Envelope targetEnvelope;
            crs = crs != null ? URLDecoder.decode(crs, StandardCharsets.UTF_8.toString()) : "EPSG:3035";


            CRSAuthorityFactory factory = CRS.getAuthorityFactory(true);
            targetCRS = factory.createCoordinateReferenceSystem(crs);
            logger.finer(coverage.getCoordinateReferenceSystem2D().toWKT());
            GridGeometry2D gridGeometry = coverage.getGridGeometry();
            MathTransform transform = CRS.findMathTransform(gridGeometry.getCoordinateReferenceSystem(),
                targetCRS);
            targetEnvelope = JTS.transform(dataEnvelope, null, transform, 10);

            // TODO create indexed image if not already indexed
            RenderedImage img = WebUtil.render(coverage, targetCRS, targetEnvelope,
                    WebUtil.getSLD(DataLayerREST.class.getClassLoader().getResourceAsStream(
                            props.getProperty("data.styles." + layerType.toString().toLowerCase()))));

            byte[] samples = (byte[]) (img.getData().getDataElements(img.getMinX(), img.getMinY(),
                    img.getWidth(),
                    img.getHeight(), null));
            DataBuffer buf = new DataBufferByte(samples, samples.length); //
            SampleModel sm =/* new PixelInterleavedSampleModel(DataBuffer.TYPE_BYTE, img.getWidth(), img
            .getHeight(), 1,*/
                    img.getSampleModel().createCompatibleSampleModel(img.getWidth(), img.getHeight());
            ColorModel cm = img.getColorModel();
            var raster = Raster.createWritableRaster(sm, buf, null);
            var image = new BufferedImage(cm, raster, false, null);
            JsonArray extent = WebUtil.createExtent(targetEnvelope);

            byte[] bs = DataLayerService.addMetaData(image, cm, sm, "extent", extent.toString());
            if (cache != null)
                cache.put(cacheKey, bs);

            var cc = new CacheControl();
            cc.setMaxAge(WebUtil.ONE_YEAR_IN_SECONDS);

            return ok(bs, "image/png")
                    // TODO add hint for client to cache resource. Etag?
                    // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching
                    .header("SYM-Image-Extent", extent.toString())
                    .cacheControl(cc)
                    .build();
        }
    }
}
