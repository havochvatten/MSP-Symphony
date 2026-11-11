package se.havochvatten.symphony.util;

import org.junit.Test;

import java.awt.image.BufferedImage;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;

public class StyleFingerprintTest {

    @Test
    public void sameContentSameFingerprint() {
        String fp = StyleFingerprint.of(bytes("a"));
        assertEquals(fp, StyleFingerprint.of(bytes("a")));
        assertEquals(16, fp.length());
    }

    @Test
    public void differentContentDifferentFingerprint() {
        assertNotEquals(StyleFingerprint.of(bytes("a")), StyleFingerprint.of(bytes("b")));
    }

    @Test
    public void resourceFingerprintMatchesContent() throws Exception {
        byte[] content;
        try (InputStream in = getClass().getClassLoader().getResourceAsStream("styles/ecosystem.xml")) {
            content = in.readAllBytes();
        }
        assertEquals(StyleFingerprint.of(content), StyleFingerprint.ofResource("styles/ecosystem.xml"));
    }

    @Test(expected = IllegalArgumentException.class)
    public void missingResourceThrows() {
        StyleFingerprint.ofResource("styles/does-not-exist.xml");
    }

    @Test
    public void combinedChangesWhenAnyStyleChanges() {
        assertNotEquals(
            StyleFingerprint.combined(List.of("styles/ecosystem.xml", "styles/pressure.xml")),
            StyleFingerprint.combined(List.of("styles/ecosystem.xml", "styles/result-style.xml")));
    }

    @Test
    public void metadataRoundTripKeepsAllEntries() throws Exception {
        byte[] png = stampedPng("abc");
        assertEquals("[1,2,3,4]", MetaDataUtil.readMetaData(png, "extent"));
        assertEquals("abc", MetaDataUtil.readMetaData(png, StyleFingerprint.METADATA_KEY));
    }

    @Test
    public void stampedPngMatchesOnlyItsFingerprint() throws Exception {
        byte[] png = stampedPng("abc");
        assertTrue(StyleFingerprint.isStampedWith(png, "abc"));
        assertFalse(StyleFingerprint.isStampedWith(png, "def"));
    }

    @Test
    public void unstampedPngIsNotCurrent() throws Exception {
        BufferedImage img = new BufferedImage(2, 2, BufferedImage.TYPE_INT_ARGB);
        byte[] png = MetaDataUtil.addMetaData(img, img.getColorModel(), img.getSampleModel(), "extent", "[1,2,3,4]");
        assertFalse(StyleFingerprint.isStampedWith(png, "abc"));
    }

    @Test
    public void unreadableInputIsNotCurrent() {
        assertFalse(StyleFingerprint.isStampedWith(bytes("not a png"), "abc"));
    }

    private static byte[] stampedPng(String fingerprint) throws Exception {
        Map<String, String> entries = new LinkedHashMap<>();
        entries.put("extent", "[1,2,3,4]");
        entries.put(StyleFingerprint.METADATA_KEY, fingerprint);
        BufferedImage img = new BufferedImage(2, 2, BufferedImage.TYPE_INT_ARGB);
        return MetaDataUtil.addMetaData(img, img.getColorModel(), img.getSampleModel(), entries);
    }

    private static byte[] bytes(String s) {
        return s.getBytes(StandardCharsets.UTF_8);
    }
}
