package se.havochvatten.symphony.web;

import org.apache.commons.lang3.time.StopWatch;

import java.io.BufferedOutputStream;
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
        File cacheRoot = this.dir.toFile();
        if (!cacheRoot.exists() && !cacheRoot.mkdirs()) {
            logger.warning("Unable to create cache root directory: " + cacheRoot.getAbsolutePath());
        }
    }

    public void put(Path key, byte[] data) throws IOException {
        StopWatch writeWatch = StopWatch.createStarted();
        File parent = this.dir.resolve(key).getParent().toFile();
        if (!parent.exists() && !parent.mkdirs()) {
            logger.warning("Unable to create cache parent directory: " + parent.getAbsolutePath());
        }

        try {
            // Write to temp file first and rename upon completion to avoid races
            File tmp = File.createTempFile("symphony_", ".png", dir.toFile());

            try (BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(tmp))) {
                // TODO add extent as metadata to file: http://www.javased.com/?post=721918
                bos.write(data);
                bos.flush();
            }

            Path target = Files.move(tmp.toPath(), dir.resolve(key), StandardCopyOption.ATOMIC_MOVE); //
            // fails when
            logger.log(Level.INFO, () -> String.format("Cached data layer at %s (%d ms)", target, writeWatch.getTime()));
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
