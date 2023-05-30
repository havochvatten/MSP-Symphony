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
import org.w3c.dom.NodeList;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.service.BaselineVersionService;
import se.havochvatten.symphony.service.DataLayerService;
import se.havochvatten.symphony.service.PropertiesService;

import javax.annotation.PostConstruct;
import javax.annotation.security.RolesAllowed;
import javax.ejb.EJB;
import javax.imageio.*;
import javax.imageio.metadata.IIOMetadataFormatImpl;
import javax.imageio.metadata.IIOMetadataNode;
import javax.json.JsonArray;
import javax.ws.rs.*;
import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.Response;
import java.awt.image.*;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
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
    private final static String rootNode = "javax_imageio_png_1.0";

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
            String extent = readMetaData(bytes, "extent");
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

            byte[] bs = addMetaData(image, cm, sm, "extent", extent.toString());
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


    public static byte[] addMetaData(BufferedImage buffImg, ColorModel cm, SampleModel sm, String key,
                                     String value) throws Exception {
        ImageWriter writer = ImageIO.getImageWritersByFormatName("png").next();

        ImageWriteParam writeParam = writer.getDefaultWriteParam();
        ImageTypeSpecifier typeSpecifier = new ImageTypeSpecifier(cm, sm);
        javax.imageio.metadata.IIOMetadata metadata = writer.getDefaultImageMetadata(typeSpecifier,
                writeParam);

        IIOMetadataNode textEntry = new IIOMetadataNode("tEXtEntry");
        textEntry.setAttribute("keyword", key);
        textEntry.setAttribute("value", value);

        IIOMetadataNode text = new IIOMetadataNode("tEXt");
        text.appendChild(textEntry);

        IIOMetadataNode root = new IIOMetadataNode(rootNode);
        root.appendChild(text);

        metadata.mergeTree(rootNode, root);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (
                javax.imageio.stream.ImageOutputStream stream = ImageIO.createImageOutputStream(baos)
        ) {
            writer.setOutput(stream);
            writer.write(metadata, new IIOImage(buffImg, null, metadata), writeParam);
        }
        return baos.toByteArray();
    }

    public static String readMetaData(byte[] imageData, String key) throws IOException {
        ImageReader imageReader = ImageIO.getImageReadersByFormatName("png").next();
        imageReader.setInput(ImageIO.createImageInputStream(new ByteArrayInputStream(imageData)), true);
        javax.imageio.metadata.IIOMetadata metadata = imageReader.getImageMetadata(0);
        IIOMetadataNode root =
                (IIOMetadataNode) metadata.getAsTree(IIOMetadataFormatImpl.standardMetadataFormatName);
        NodeList entries = root.getElementsByTagName("TextEntry");

        for (int i = 0; i < entries.getLength(); i++) {
            IIOMetadataNode node = (IIOMetadataNode) entries.item(i);
            if (node.getAttribute("keyword").equals(key)) {
                return node.getAttribute("value");
            }
        }

        return null;
    }
}
