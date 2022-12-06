package se.havochvatten.symphony.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import it.geosolutions.jaiext.stats.HistogramMode;
import it.geosolutions.jaiext.stats.Statistics;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.GridGeometry2D;
import org.geotools.geometry.jts.JTS;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.geotools.referencing.operation.transform.AffineTransform2D;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import se.havochvatten.symphony.calculation.Operations;
import se.havochvatten.symphony.calculation.SankeyChart;
import se.havochvatten.symphony.dto.*;
import se.havochvatten.symphony.entity.AreaType;
import se.havochvatten.symphony.entity.CalculationResult;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.util.Util;
import si.uom.SI;
import tech.units.indriya.quantity.Quantities;

import javax.ejb.EJB;
import javax.ejb.Singleton;
import javax.inject.Inject;
import javax.measure.Quantity;
import javax.measure.UnconvertibleException;
import javax.measure.Unit;
import javax.measure.quantity.Length;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static java.util.stream.Collectors.toMap;

@Singleton
public class ReportService {
    private static final ObjectMapper mapper = new ObjectMapper();

    // The CSV standard (RFC 4180) actually says to use comma, but tab is MS Excel default. Or use TSV?
    private static final char CSV_FIELD_SEPARATOR = '\t';

    @EJB
    private Operations operations;

    @Inject
    MetaDataService metaDataService;

    @Inject
    SensMatrixService matrixService;

    @Inject
    AreaTypeService areaTypeService;

    @Inject
    PropertiesService props;

    record StatisticsResult(double min, double max, double average, double stddev, double[] histogram, long pixels){}

    private StatisticsResult getStatistics(GridCoverage2D coverage) {
        Statistics[] simpleStats = operations.stats(coverage, new int[]{0}, new Statistics.StatsType[]{
                Statistics.StatsType.EXTREMA,
                Statistics.StatsType.MEAN,
                Statistics.StatsType.DEV_STD })[0];

        double[] extrema = (double[]) simpleStats[0].getResult();
        double max = extrema[1] + (Math.ulp(extrema[1]) * 100);

        HistogramMode histogram =
            operations.histogram(coverage, 0.0, max, 100);

        return new StatisticsResult(extrema[0], extrema[1],
                        (double) simpleStats[1].getResult(),
                        (double) simpleStats[2].getResult(),
                        (double[]) histogram.getResult(),
                        simpleStats[0].getNumSamples());
    }

    private static double getResolutionInMetres(GridCoverage2D coverage) {
        double result;
        GridGeometry2D geometry = coverage.getGridGeometry();
        Double scale = ((AffineTransform2D) geometry.getGridToCRS()).getScaleX();
        Unit<Length> unit = (Unit<Length>) geometry.getCoordinateReferenceSystem2D().getCoordinateSystem().getAxis(0).getUnit();
        Quantity<Length> resolution = Quantities.getQuantity(scale, unit);

        try {
            result = resolution.to(SI.METRE).getValue().doubleValue();
        } catch (UnconvertibleException e) { // Coordinate system isn't projected, unit (rad/deg) cannot be converted.
                                             // We could check the CoordinateSystem or specific types of Unit but
                                             // let it throw instead at the conversion stage.
            result = Double.NaN;
        }

        return result;
    }

    /**
     * @param pTotal  output param containing pressure row total
     * @param esTotal output param containing ecosystem column total
     */
    static double getComponentTotals(double[][] matrix, double[] pTotal, double[] esTotal) {
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

    private static Map<Integer, Double> impactPerComponent(int[] components, double[] totals) {
        return IntStream
                .range(0, components.length).boxed()
                .collect(toMap(i -> components[i], i -> totals[i]));
    }

    public ReportResponseDto generateReportData(CalculationResult calc, boolean computeChart)
            throws FactoryException, TransformException {
        var scenario = calc.getScenarioSnapshot();
        var coverage = calc.getCoverage();
        var stats = getStatistics(coverage);

        var impactMatrix = calc.getImpactMatrix();
        int pLen = impactMatrix.length, esLen = impactMatrix[0].length;

        double[] pTotal = new double[pLen];
        double[] esTotal = new double[esLen];
        // N.B: Will set pTotal and esTotal as side effect!
        double total = getComponentTotals(impactMatrix, pTotal, esTotal);

        ReportResponseDto report = new ReportResponseDto();

        report.baselineName = calc.getBaselineVersion().getName();
        report.operationName = calc.getOperationName();
        report.operationOptions = calc.getOperationOptions() != null ?
            calc.getOperationOptions() : Collections.emptyMap();
        report.name = calc.getCalculationName();
        // Does not sum to exactly 100% for some reason? I.e. assert(getComponentTotals(...) == stats
        // .getSum()) not always true. Tolerance?
        report.total = total; //stats.getSum();
        report.min       = stats.min;
        report.max       = stats.max;
        report.average   = stats.average;
        report.stddev    = stats.stddev;
        report.histogram = stats.histogram;

        report.calculatedPixels = stats.pixels;

        double resolution = getResolutionInMetres(coverage);
        report.gridResolution = Double.isNaN(resolution) ? Double.NaN :
                                Math.round(resolution * 100) / 100;
                                // Round to two decimal places and guard for NaN
                                // since Math.round(Double.NaN) returns 0
        try {
            var matrixParams = mapper.treeToValue(scenario.getMatrix(), MatrixParameters.class);
            if (matrixParams.userDefinedMatrixId != null) {
                var mx = matrixService.getSensMatrixbyId(matrixParams.userDefinedMatrixId);
                report.matrix = mx.getName();
                report.altMatrix = mx.getOwner() == null;
            } else {
                Map<Integer, AreaType> areaTypes =
                        areaTypeService.findAll().stream().collect(toMap(AreaType::getId,
                                areaType -> areaType));
                // TODO: Get the real matrix name later
                report.matrix = new ReportResponseDto.DefaultMatrixData("Default area matrix",
                        matrixParams.areaTypes
                                .stream()
                                .filter(areaTypeRef -> !areaTypes.get(areaTypeRef.id).isCoastalArea())
                                .collect(toMap(areaTypeRef ->
                                                areaTypes.get(areaTypeRef.id).getAtypeName(),
                                        (MatrixParameters.AreaTypeRef areaType) ->
                                                areaType.areaMatrices
                                                        .stream()
                                                        .filter(Util.distinctByKey(AreaMatrixMapping::getMatrixId))
                                                        .map(mapping -> this.getMatrixName(mapping.getMatrixId()))
                                                        .toArray(String[]::new))));
            }
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        } catch (SymphonyStandardAppException e) {
            report.matrix = "<unknown>";
        }

        report.normalization = scenario.getNormalization();
        report.impactPerPressure = impactPerComponent(scenario.getPressuresToInclude(), pTotal);
        report.impactPerEcoComponent = impactPerComponent(scenario.getEcosystemsToInclude(), esTotal);
        if (computeChart)
            report.chartData = new SankeyChart(scenario.getEcosystemsToInclude(),
                scenario.getPressuresToInclude(), impactMatrix, total,
                props.getPropertyAsDouble("calc.sankey_chart.link_weight_threshold", 0.001)
            ).getChartData();

        report.geographicalArea = JTS.transform(scenario.getGeometry(),
                CRS.findMathTransform(DefaultGeographicCRS.WGS84,
                        coverage.getCoordinateReferenceSystem2D())).getArea();

        report.scenarioChanges = scenario.getChanges();
        report.timestamp = calc.getTimestamp().getTime();

        return report;
    }

    public ComparisonReportResponseDto generateComparisonReportData(CalculationResult calcA,
                                                                    CalculationResult calcB)
            throws FactoryException, TransformException {
        var report = new ComparisonReportResponseDto();
        report.a = generateReportData(calcA, false);
        report.b = generateReportData(calcB, false);
        return report;
    }

    private String getMatrixName(int id) {
        try {
            return matrixService.getSensMatrixbyId(id).getName();
        } catch (SymphonyStandardAppException e) {
            throw new RuntimeException(e);
        }
    }

    private MetadataPropertyDto[] flattenAndSort(MetadataComponentDto component) {
        return component.getSymphonyTeams().stream().flatMap(team -> team.getProperties().stream()).sorted(Comparator.comparingInt(MetadataPropertyDto::getBandNumber)).toArray(MetadataPropertyDto[]::new);
    }

    public String generateCSVReport(CalculationResult calc, Locale locale) throws SymphonyStandardAppException {
        var metadata = metaDataService.findMetadata(calc.getBaselineVersion().getName());
        var ecocomponentMetadata = flattenAndSort(metadata.getEcoComponent());
        var pressureMetadata = flattenAndSort(metadata.getPressureComponent());

        var scenario = calc.getScenarioSnapshot();
        var featuredEcosystems = scenario.getEcosystemsToInclude();
        var featuredPressures = scenario.getPressuresToInclude();

        var impactMatrix = calc.getImpactMatrix();
        double[] pTotal = new double[impactMatrix.length];
        double[] esTotal = new double[impactMatrix[0].length];
        var total = getComponentTotals(impactMatrix, pTotal, esTotal);

        var string = new StringWriter();
        try (PrintWriter writer = new PrintWriter(string)) {
            // Sankey header line
            writer.print(calc.getCalculationName());
            writer.print(CSV_FIELD_SEPARATOR);
            writer.print(Arrays.stream(featuredEcosystems).mapToObj(e -> ecocomponentMetadata[e].getTitle()) // column headers
                    .collect(Collectors.joining(String.valueOf(CSV_FIELD_SEPARATOR))));
            writer.println(CSV_FIELD_SEPARATOR + "TOTAL");

            // Sankey matrix body
            IntStream.range(0, featuredPressures.length).forEach(i -> {
                writer.print(pressureMetadata[featuredPressures[i]].getTitle()); // pressure row header
                writer.print(CSV_FIELD_SEPARATOR);
                IntStream.range(0, featuredEcosystems.length).forEach(j -> {
                    writer.print(impactMatrix[i][j]);
                    writer.print(CSV_FIELD_SEPARATOR);
                });
                writer.println(pTotal[i]);
            });

            writer.print("TOTAL");
            IntStream.range(0, featuredEcosystems.length).forEach(j ->
                writer.format(locale, "%c%.4f", CSV_FIELD_SEPARATOR, esTotal[j])
            );
            writer.format(locale, "%c%.4f", CSV_FIELD_SEPARATOR, total);
            writer.println();
            writer.println();

            // Impact per pressure
            writer.println("PRESSURE" + CSV_FIELD_SEPARATOR + "Impact per Pressure");
            IntStream.range(0, featuredPressures.length).forEach(i -> {
                writer.print(pressureMetadata[featuredPressures[i]].getTitle());
                writer.print(CSV_FIELD_SEPARATOR);
                writer.format(locale, "%.2f%%", 100 * pTotal[i] / total);
                writer.println();
            });
            writer.println();

            // Impact per pressure
            writer.println("ECOSYSTEM" + CSV_FIELD_SEPARATOR + "Impact per Ecosystem");
            IntStream.range(0, featuredEcosystems.length).forEach(i -> {
                writer.print(pressureMetadata[featuredEcosystems[i]].getTitle());
                writer.print(CSV_FIELD_SEPARATOR);
                writer.format(locale, "%.2f%%", 100 * esTotal[i] / total);
                writer.println();
            });
        }
        string.flush();
        return string.toString();
    }
}
