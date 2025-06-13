package se.havochvatten.symphony.util;

import org.w3c.dom.NodeList;

import javax.imageio.*;
import javax.imageio.metadata.IIOMetadataFormatImpl;
import javax.imageio.metadata.IIOMetadataNode;
import java.awt.image.BufferedImage;
import java.awt.image.ColorModel;
import java.awt.image.SampleModel;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

public final class MetaDataUtil {
    private MetaDataUtil() {}

    public static byte[] addMetaData(BufferedImage buffImg, ColorModel cm, SampleModel sm, String key,
                                     String value) throws Exception {
        String rootNode = "javax_imageio_png_1.0";

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
