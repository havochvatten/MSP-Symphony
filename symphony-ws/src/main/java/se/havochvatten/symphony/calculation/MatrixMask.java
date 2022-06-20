package se.havochvatten.symphony.calculation;

import org.geotools.coverage.grid.GridGeometry2D;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.LiteShape2;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.locationtech.jts.geom.Geometry;
import org.opengis.referencing.FactoryException;
import se.havochvatten.symphony.dto.AreaMatrixResponse;

import javax.media.jai.ImageLayout;
import javax.persistence.Transient;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.awt.image.Raster;
import java.awt.image.RenderedImage;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/* Immutable */
public class MatrixMask {
    private static final Logger logger = Logger.getLogger(MatrixMask.class.getName());

    // should color zero be transparent instead?
    private static final Color[] palette = new Color[] {
            Color.black/*transparent background color*/,
            Color.blue,
            Color.yellow,
            Color.red,
            Color.cyan
    };
    private static final int EXCLUDE = palette.length;

    private ImageLayout layout;

    @Transient
    private final BufferedImage image;

    /**
     * Create matrix mask
     *
     * @param gridGeometry grid geometry of mask
     * @param areas areas to iterate through
     * @param matrixIdToPaletteIndex map from matrix id to palette color index
     */
    public MatrixMask(GridGeometry2D gridGeometry, ImageLayout layout, List<AreaMatrixResponse> areas,
                      Map<Integer, Integer> matrixIdToPaletteIndex) throws FactoryException {
        this.layout = layout;

        // Or create writableraster with origin location?
        this.image = new BufferedImage(layout.getWidth(null), layout.getHeight(null),
                BufferedImage.TYPE_BYTE_INDEXED, CalcUtil.makeIndexedColorModel(palette));

        paint(image.createGraphics(), gridGeometry, /*transform,*/ areas, matrixIdToPaletteIndex);
    }

    private void paint(Graphics2D g2, GridGeometry2D gridGeometry, /*MathTransform targetTransform,*/
                       List<AreaMatrixResponse> areas, Map<Integer, Integer> matrixIdToIndex) throws FactoryException {
        var targetTransform  = CRS.findMathTransform(DefaultGeographicCRS.WGS84,
                gridGeometry.getCoordinateReferenceSystem2D());

        // extract from class
        List<AreaMatrixResponse> orderedAreas =
                Stream.concat(
                        areas.stream().filter(AreaMatrixResponse::isDefaultArea),
                        areas.stream().filter(Predicate.not(AreaMatrixResponse::isDefaultArea))).
                        collect(Collectors.toList());

        orderedAreas.forEach(area -> {
            area.getPolygons().forEach((polygon) -> {
                try {
                    Geometry projectedGeometry = JTS.transform(polygon, targetTransform);
                    var shape = new LiteShape2(projectedGeometry, gridGeometry.getCRSToGrid2D(), null, false);
                    g2.setColor(palette[matrixIdToIndex.get(area.getMatrixId())]);
                    g2.fill(shape);
                } catch (Exception e) {
                    logger.severe("Error with polygon: "+e);
                }
            });
        });
    }

    /** @return the mask as a bitmap, suitable for saving and visualization */
    public RenderedImage getImage() {
        return image; //new PlanarImage(layout, new Vector(List.of(image)), null);
    }

    /** @return the mask as a raster, suitable for further calculation */
    public Raster getRaster() {
        return image.getRaster().createWritableTranslatedChild(layout.getMinX(null), layout.getMinY(null));
    }
}
