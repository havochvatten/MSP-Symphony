package se.havochvatten.symphony.util;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Content fingerprints of the style (SLD) files that render map images. Cached and stored images carry the
 * fingerprint of the style that drew them, so a changed style misses the cache and the image is re-drawn.
 */
public final class StyleFingerprint {
    public static final String METADATA_KEY = "styleFingerprint";

    private static final int LENGTH = 16;
    private static final Map<String, String> RESOURCE_FINGERPRINTS = new ConcurrentHashMap<>();

    private StyleFingerprint() {}

    /** SHA-256 of the content, as the first 16 lowercase hex characters. */
    public static String of(byte[] content) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(content);
            return HexFormat.of().formatHex(digest).substring(0, LENGTH);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    /** Fingerprint of a class path resource, computed once per resource path. */
    public static String ofResource(String resourcePath) {
        return RESOURCE_FINGERPRINTS.computeIfAbsent(resourcePath, StyleFingerprint::readAndFingerprint);
    }

    /** One fingerprint over several resources; changes when any of them changes. Order is significant. */
    public static String combined(List<String> resourcePaths) {
        String joined = String.join(",", resourcePaths.stream().map(StyleFingerprint::ofResource).toList());
        return of(joined.getBytes(StandardCharsets.UTF_8));
    }

    /** True only if the PNG carries exactly this fingerprint in its metadata; false for unreadable input. */
    public static boolean isStampedWith(byte[] png, String fingerprint) {
        try {
            return fingerprint.equals(MetaDataUtil.readMetaData(png, METADATA_KEY));
        } catch (Exception e) {
            return false;
        }
    }

    private static String readAndFingerprint(String resourcePath) {
        try (InputStream in = StyleFingerprint.class.getClassLoader().getResourceAsStream(resourcePath)) {
            if (in == null) {
                throw new IllegalArgumentException("Style resource not found: " + resourcePath);
            }
            return of(in.readAllBytes());
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
