package se.havochvatten.symphony.web;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ImageCache {
    private static final Logger logger = Logger.getLogger(ImageCache.class.getName());
    private final Path dir;

    ImageCache(String cacheDir) {
        this.dir = Path.of(cacheDir);
        this.dir.toFile().mkdirs();
    }

    public void put(Path key, byte[] data) throws IOException {
        File parent = this.dir.resolve(key).getParent().toFile();
        if (!parent.exists()) parent.mkdirs();

        try {
            // Write to temp file first and rename upon completion to avoid races
            File tmp = File.createTempFile("symphony_", ".png", dir.toFile());

            try (FileOutputStream fos = new FileOutputStream(tmp)) {
                // TODO add extent as metadata to file: http://www.javased.com/?post=721918
                fos.write(data);
            }

            Path target = Files.move(tmp.toPath(), dir.resolve(key), StandardCopyOption.ATOMIC_MOVE); //
            // fails when
            logger.log(Level.INFO, () -> String.format("Cached data layer at %s", target));
        } catch (IOException e) {
            logger.severe("Unable to cache data layer of key=" + key);
        }
    }

    public boolean containsKey(Path key) {
        return dir.resolve(key).toFile().exists();
    }

    public byte[] get(Path key) throws IOException {
        try {
            return Files.readAllBytes(dir.resolve(key));
        } catch (IOException e) {
            return new byte[]{};
        }
    }
}
