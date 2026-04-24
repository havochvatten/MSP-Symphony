package se.havochvatten.symphony.util;

import org.w3c.dom.NodeList;

import javax.imageio.*;
import javax.imageio.metadata.IIOMetadataFormatImpl;
import javax.imageio.metadata.IIOMetadataNode;
import java.awt.image.RenderedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Locale;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.commons.lang3.time.StopWatch;

public final class MetaDataUtil {
    private static final Logger logger = Logger.getLogger(MetaDataUtil.class.getName());
    private static final ThreadLocal<ImageWriter> PNG_WRITER = ThreadLocal.withInitial(() ->
        ImageIO.getImageWritersByFormatName("png").next());

    private static final String PNG_PRESET_PROPERTY = "symphony.png.compression.preset";
    private static final String PNG_QUALITY_PROPERTY = "symphony.png.compression.quality";

    private MetaDataUtil() {}

    public static byte[] addMetaData(RenderedImage image, String key, String value) throws Exception {
        StopWatch totalWatch = StopWatch.createStarted();
        String rootNode = "javax_imageio_png_1.0";

        ImageWriter writer = PNG_WRITER.get();

        ImageWriteParam writeParam = writer.getDefaultWriteParam();
        applyCompressionPreset(writeParam);

        StopWatch metadataWatch = StopWatch.createStarted();
        ImageTypeSpecifier typeSpecifier = ImageTypeSpecifier.createFromRenderedImage(image);
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
        long metadataTime = metadataWatch.getTime();

        ByteArrayOutputStream baos = new ByteArrayOutputStream(estimateInitialCapacity(image));
        StopWatch writeWatch = StopWatch.createStarted();
        try (javax.imageio.stream.ImageOutputStream stream = ImageIO.createImageOutputStream(baos)) {
            writer.setOutput(stream);
            writer.write(metadata, new IIOImage(image, null, metadata), writeParam);
        } finally {
            writer.setOutput(null);
            writer.reset();
        }

        long writeTime = writeWatch.getTime();
        StopWatch byteArrayWatch = StopWatch.createStarted();
        byte[] bytes = baos.toByteArray();
        long byteArrayTime = byteArrayWatch.getTime();
        logger.log(Level.INFO, () -> String.format("[HEATMAP_DEBUG] MetaDataUtil.addMetaData finished total=%d ms (metadata=%d ms, writerWrite=%d ms, toByteArray=%d ms, bytes=%d)",
            totalWatch.getTime(), metadataTime, writeTime, byteArrayTime, bytes.length));

        return bytes;
    }

    private static int estimateInitialCapacity(RenderedImage image) {
        long width = Math.max(1, image.getWidth());
        long height = Math.max(1, image.getHeight());
        long estimate = width * height;
        long bounded = Math.max(64L * 1024L, Math.min(estimate, 32L * 1024L * 1024L));
        return (int) bounded;
    }

    private static void applyCompressionPreset(ImageWriteParam writeParam) {
        if (!writeParam.canWriteCompressed()) {
            return;
        }

        writeParam.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);

        String qualityProperty = System.getProperty(PNG_QUALITY_PROPERTY);
        if (qualityProperty != null && !qualityProperty.isBlank()) {
            try {
                float quality = Float.parseFloat(qualityProperty);
                writeParam.setCompressionQuality(Math.max(0f, Math.min(1f, quality)));
                return;
            } catch (NumberFormatException ignored) {
                // fall through to preset handling
            }
        }

        String preset = System.getProperty(PNG_PRESET_PROPERTY, "balanced").toLowerCase(Locale.ROOT);
        float quality = switch (preset) {
            case "fast" -> 1.0f;
            case "smallest", "small", "max" -> 0.1f;
            case "balanced", "default" -> 0.5f;
            default -> 0.5f;
        };
        logger.log(Level.INFO, () -> String.format("[HEATMAP_DEBUG] Using PNG compression quality preset '%s': %.2f", preset, quality));
        writeParam.setCompressionQuality(quality);
    }

    public static String readMetaData(byte[] imageData, String key) throws IOException {
        ImageReader imageReader = ImageIO.getImageReadersByFormatName("png").next();
        try (ByteArrayInputStream byteStream = new ByteArrayInputStream(imageData);
             javax.imageio.stream.ImageInputStream imageInputStream = ImageIO.createImageInputStream(byteStream)) {
            imageReader.setInput(imageInputStream, true);
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
        } finally {
            imageReader.dispose();
        }

        return null;
    }
}
