package se.havochvatten.symphony.service;

import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.io.AbstractGridFormat;
import org.geotools.coverage.grid.io.GridFormatFinder;
import org.geotools.coverage.processing.Operations;
import org.geotools.util.factory.Hints;
import org.w3c.dom.NodeList;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.imageio.*;
import javax.imageio.metadata.IIOMetadataFormatImpl;
import javax.imageio.metadata.IIOMetadataNode;
import java.awt.image.BufferedImage;
import java.awt.image.ColorModel;
import java.awt.image.SampleModel;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;

@Stateless
public class DataLayerService {

    private static final String rootNode = "javax_imageio_png_1.0";

    @EJB
    BaselineVersionService baselineVersionService;

    @EJB
    PropertiesService props;

    // TODO cache instances of layer type and baselineVersionId?
    public GridCoverage2D getCoverage(LayerType type, int baselineVersionId) throws IOException {
        String filename = getComponentFilePath(type, baselineVersionId);
        File file = new File(filename);
        // See https://docs.geotools.org/latest/userguide/library/referencing/order.html
        Hints hints = new Hints(Hints.FORCE_LONGITUDE_FIRST_AXIS_ORDER, Boolean.TRUE);
        AbstractGridFormat format = GridFormatFinder.findFormat(file);
        return format.getReader(file, hints).read(null);
    }

    public GridCoverage2D getDataLayer(LayerType type, int baselineVersionId, int bandNo) throws IOException, SymphonyStandardAppException {
        var coverage = getCoverage(type, baselineVersionId);
        return (GridCoverage2D) Operations.DEFAULT.selectSampleDimension(coverage, new int[]{bandNo});
    }

    String getComponentFilePath(LayerType type, int baselineVersionId) {
        // To use for development purpose
        String localDevFilePath = localDevFilePath(type);
        if (localDevFilePath != null) {
            return localDevFilePath;
        }
        // component file path registered in baselineVersion
        BaselineVersion baselineVersion = baselineVersionService.getBaselineVersionById(baselineVersionId);
        String fileNameAndPath = null;
        if (LayerType.ECOSYSTEM.equals(type)) {
            fileNameAndPath = baselineVersion.getEcosystemsFilePath();
        } else if (LayerType.PRESSURE.equals(type)) {
            fileNameAndPath = baselineVersion.getPressuresFilePath();
        }

        return fileNameAndPath;
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

    /**
     * For development purpose only.
     *
     * @return local file path for layer type if property found in local properties file. Returns null if not
     * fount in local properties file
     */
    private String localDevFilePath(LayerType type) {
        String fileNameAndPath = null;
        if (LayerType.ECOSYSTEM.equals(type)) {
            fileNameAndPath = props.getProperty("data.localdev.ecosystems");
        } else if (LayerType.PRESSURE.equals(type)) {
            fileNameAndPath = props.getProperty("data.localdev.pressures");
        }
        return fileNameAndPath;
    }
}
