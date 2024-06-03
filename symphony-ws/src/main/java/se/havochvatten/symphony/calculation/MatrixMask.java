package se.havochvatten.symphony.calculation;

import org.geotools.coverage.grid.GridGeometry2D;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.LiteShape2;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.locationtech.jts.geom.Geometry;
import org.opengis.referencing.FactoryException;
import se.havochvatten.symphony.dto.MatrixResponse;
import se.havochvatten.symphony.entity.ScenarioArea;

import javax.imageio.ImageIO;
import javax.media.jai.ImageLayout;
import javax.persistence.Transient;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.awt.image.Raster;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.IntStream;

/* Immutable */
public class MatrixMask { // TODO: Make serializable for distributed session management
    private static final Logger logger = Logger.getLogger(MatrixMask.class.getName());

    // should color zero be transparent instead?
    private final Color[] palette;

    private final ImageLayout layout;

    @Transient
    private final BufferedImage image;

    /**
     * Create matrix mask
     *
     * @param gridGeometry grid geometry of mask
     * @param areas areas to iterate through
     * @param matrixIdToPaletteIndex map from matrix id to palette color index
     */
    public MatrixMask(GridGeometry2D gridGeometry, ImageLayout layout, MatrixResponse matrixResponse,
                      List<ScenarioArea> areas, Map<Integer, Integer> matrixIdToPaletteIndex, Geometry coastalComplement) throws FactoryException {
        this.layout = layout;

        this.palette = IntStream.range(0, matrixIdToPaletteIndex.size() + 1).mapToObj(Color::new).toArray(Color[]::new);

        // Or create writableraster with origin location?
        this.image = new BufferedImage(layout.getWidth(null), layout.getHeight(null),
                BufferedImage.TYPE_BYTE_INDEXED, CalcUtil.makeIndexedColorModel(palette));

        paint(image.createGraphics(), gridGeometry, matrixResponse, areas, matrixIdToPaletteIndex, coastalComplement);
    }

    private void paint(Graphics2D g2, GridGeometry2D gridGeometry,
                    MatrixResponse matrixResponse, List<ScenarioArea> areas,
                    Map<Integer, Integer> matrixIdToIndex, Geometry coastalComplement) throws FactoryException {
        var targetTransform  = CRS.findMathTransform(DefaultGeographicCRS.WGS84,
            gridGeometry.getCoordinateReferenceSystem2D());

        areas.forEach(area -> {
            try {
                Geometry areaGeometry = coastalComplement != null ? area.getGeometry().intersection(coastalComplement) : area.getGeometry();
                Geometry projectedGeometry = JTS.transform(areaGeometry, targetTransform);
                var shape = new LiteShape2(projectedGeometry, gridGeometry.getCRSToGrid2D(), null, false);
                g2.setColor(palette[matrixIdToIndex.get(matrixResponse.getAreaMatrixId(area.getId()))]);
                g2.fill(shape);
            } catch (Exception e) {
                logger.severe("Error with polygon: "+e);
            }
        });
    }

    /** @return the mask as a PNG, suitable for saving and visualization */
    public byte[] getAsPNG() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "png", baos);
        return baos.toByteArray();
    }

    /** @return the mask as a raster, suitable for further calculation */
    public Raster getRaster() {
        return image.getRaster().createWritableTranslatedChild(layout.getMinX(null), layout.getMinY(null));
    }
}
