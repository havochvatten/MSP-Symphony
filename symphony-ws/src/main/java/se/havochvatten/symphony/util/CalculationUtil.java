package se.havochvatten.symphony.util;

import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.GridGeometry2D;
import org.geotools.geojson.geom.GeometryJSON;
import org.geotools.measure.Units;
import org.geotools.referencing.operation.transform.AffineTransform2D;
import org.locationtech.jts.geom.Geometry;
import se.havochvatten.symphony.dto.SensitivityMatrix;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.service.CalcService;
import tech.units.indriya.quantity.Quantities;

import javax.measure.Quantity;
import javax.measure.UnconvertibleException;
import javax.measure.Unit;
import javax.measure.quantity.Length;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

import static java.util.stream.Collectors.toMap;

public final class CalculationUtil {
    private CalculationUtil() {}

    public static String operationName(int operation) {
        // Temporary solution.
        // Should utilize enum (?) but due to inadequacies re: Hibernate mapping of
        // postgres enum data type (availalble for pgdb > v10) int is chosen instead.
        // Operation options json object is also arguably suboptimal, but kept as
        // legacy. There may be a case for a more thorough restructuring.

        return operation == CalcService.OPERATION_CUMULATIVE ?
            "CumulativeImpact" :
            "RarityAdjustedCumulativeImpact";
    }

    public static double[][][] preprocessMatrices(List<SensitivityMatrix> sensitivityMatrices) {
        return sensitivityMatrices.stream().
            map(m -> m == null ? null : m.getMatrixValues()).
            toArray(double[][][]::new);
    }

    private static final GeometryJSON geometryJSON = new GeometryJSON();

    /**
     * @return A Geometry object created from the string geoJSON
     */
    public static Geometry jsonToGeometry(String geoJSON) throws SymphonyStandardAppException {
        Geometry geometry = null;
        try {
            geometry = geometryJSON.read(geoJSON);
        } catch (IOException e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.GEOJSON_TO_GEOMETRY_CONVERSION_ERROR);
        }
        return geometry;
    }

    /**
     * @return A list of geometries (List<Geometry>) from the geoJSON list of strings geoJSONList
     */
    public static List<Geometry> jsonListToGeometryList(List<String> geoJSONList) throws SymphonyStandardAppException {
        List<Geometry> geometries = new ArrayList<>();
        for (String geoJSON : geoJSONList) {
            geometries.add(jsonToGeometry(geoJSON));
        }
        return geometries;
    }

    public static double getResolutionInMetres(GridCoverage2D coverage) {
        double result;
        GridGeometry2D geometry = coverage.getGridGeometry();
        Double scale = ((AffineTransform2D) geometry.getGridToCRS()).getScaleX();
        Unit<Length> unit = (Unit<Length>) geometry.getCoordinateReferenceSystem2D().getCoordinateSystem().getAxis(0).getUnit();
        Quantity<Length> resolution = Quantities.getQuantity(scale, unit);

        try {
            result = resolution.to(Units.METRE).getValue().doubleValue();
        } catch (UnconvertibleException e) { // Coordinate system isn't projected, unit (rad/deg) cannot be converted.
            // We could check the CoordinateSystem or specific types of Unit but
            // let it throw instead at the conversion stage.
            result = Double.NaN;
        }

        return result;
    }

    public static Map<Integer, Double> impactPerComponent(int[] components, double[] totals) {
        return IntStream
            .range(0, components.length).boxed()
            .collect(toMap(i -> components[i], i -> totals[i]));
    }

    /**
     * @param pTotal  output param containing pressure row total
     * @param esTotal output param containing ecosystem column total
     */
    public static double getComponentTotals(double[][] matrix, double[] pTotal, double[] esTotal) {
        double totalTotal = 0;
        for (int b = 0; b < matrix.length; b++) {
            for (int e = 0; e < matrix[b].length; e++) {
                pTotal[b] += matrix[b][e];
                esTotal[e] += matrix[b][e];
                totalTotal += matrix[b][e];
            }
        }
        return totalTotal;
    }
}
