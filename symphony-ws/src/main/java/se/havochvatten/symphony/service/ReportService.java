package se.havochvatten.symphony.service;

import com.fasterxml.jackson.databind.node.NullNode;
import com.github.miachm.sods.*;
import it.geosolutions.jaiext.stats.Statistics;
import org.apache.commons.lang3.StringUtils;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.geometry.jts.JTS;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import se.havochvatten.symphony.calculation.ComparisonResult;
import se.havochvatten.symphony.calculation.Operations;
import se.havochvatten.symphony.calculation.SankeyChart;
import se.havochvatten.symphony.dto.*;
import se.havochvatten.symphony.dto.CompoundComparisonExport.ComparisonResultExport;
import se.havochvatten.symphony.entity.*;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.util.ODSStyles;

import jakarta.ejb.EJB;
import jakarta.ejb.Singleton;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.io.*;
import java.util.*;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static se.havochvatten.symphony.util.CalculationUtil.*;

@Singleton
public class ReportService {
    private static final Logger logger = Logger.getLogger(ReportService.class.getName());

    // The CSV standard (RFC 4180) actually says to use comma, but tab is MS Excel default. Or use TSV?
    private static final char CSV_FIELD_SEPARATOR = '\t';

    private static final int ODF_COLUMN_HEADING_ROW = 7;
    private static final int ODF_COLUMN_SUBHEADING_ROW = ODF_COLUMN_HEADING_ROW + 1;
    private static final int ODF_TABLE_VERTICAL_OFFSET = ODF_COLUMN_HEADING_ROW + 2;
    private static final int ODF_ROW_HEADING_COLUMN = 1;
    private static final int ODF_TABLE_HORIZONTAL_OFFSET = ODF_ROW_HEADING_COLUMN + 1;
    private static final int ODF_TITLE_ROWS_TOTAL = 3;
    private static final int ODF_CALC_TOTALS_SECTION = 13;
    private static final double ODF_COMBO_VALUES = 20.0;
    private static final double ODF_COMBO_TITLES = 65.0;
    private static final double ODF_TITLE_COLWIDTH = 55.0;

    private static final Map<String, String> defaultMeta = Map.ofEntries(
        Map.entry("compoundHeading", "Compound comparison data"),
        Map.entry("scenario", "Scenario"),
        Map.entry("scenarioTitle", "Scenario title"),
        Map.entry("area", "Calculated area"),
        Map.entry("total", "Total"),
        Map.entry("sum", "Sum"),
        Map.entry("difference", "Difference"),
        Map.entry("baseline", "Baseline"),
        Map.entry("average", "Average"),
        Map.entry("stddev", "Standard deviation"),
        Map.entry("max", "Max"),
        Map.entry("pixels", "Pixels"),
        Map.entry("nonPlanar", "Non-planar projection"),
        Map.entry("ecosystem", "Ecosystem"),
        Map.entry("pressure", "Pressure"),
        Map.entry("theme", "theme"),
        Map.entry("combined", "Combined dataset")
    );

    @EJB
    private Operations operations;

    @PersistenceContext(unitName = "symphonyPU")
    public EntityManager em;

    @Inject
    MetaDataService metaDataService;

    @Inject
    SensMatrixService matrixService;

    @Inject
    CalcService calcService;

    @Inject
    PropertiesService props;

    public record MultiComparisonAuxiliary(int[] ecosystems, int[] pressures, double[][] baseline, double[][] result) {}

    public StatisticsResult getStatistics(GridCoverage2D coverage) {
        return getStatistics(coverage, true);
    }

    public StatisticsResult getStatistics(GridCoverage2D coverage, boolean includeHistogram) {
        Statistics[] simpleStats = operations.stats(coverage, new int[]{0}, new Statistics.StatsType[]{
                Statistics.StatsType.EXTREMA,
                Statistics.StatsType.MEAN,
                Statistics.StatsType.DEV_STD })[0];

        double[] extrema = (double[]) simpleStats[0].getResult();
        double max = extrema[1] + (Math.ulp(extrema[1]) * 100);

        return new StatisticsResult(extrema[0], extrema[1],
                        (double) simpleStats[1].getResult(),
                        (double) simpleStats[2].getResult(),
                        includeHistogram ?
                            (double[]) operations.histogram(coverage, 0.0, max, 100).getResult() :
                            new double[0],
                        simpleStats[0].getNumSamples());
    }

    public ReportResponseDto generateReportData(CalculationResult calc, boolean computeChart, String preferredLanguage)
        throws FactoryException, TransformException, SymphonyStandardAppException {
        var scenario = calc.getScenarioSnapshot();
        var coverage = calc.getCoverage();
        if(coverage == null) {
            logger.info("Recalculating raster data for purged calculation: '" + calc.getCalculationName() + "' " +
                             "with id " + calc.getId());
            coverage = calcService.recreateCoverageFromResult(scenario, calc);
        }

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
        report.min       = stats.min();
        report.max       = stats.max();
        report.average   = stats.average();
        report.stddev    = stats.stddev();
        report.histogram = stats.histogram();

        report.calculatedPixels = stats.pixels();

        double resolution = getResolutionInMetres(coverage);
        report.gridResolution = Double.isNaN(resolution) ? Double.NaN :
                                (double) Math.round(resolution * 100) / 100;
                                // Round to two decimal places and guard for NaN
                                // since Math.round(Double.NaN) returns 0

        report.areaMatrices = new ReportResponseDto.AreaMatrix[scenario.getAreaMatrixMap().size()];
        int am_ix = 0;
        String matrix, areaName;

        for(int areaId : scenario.getAreaMatrixMap().keySet()) {
            areaName = scenario.getAreas().get(areaId).areaName();
            try {
                matrix = matrixService.getSensMatrixbyId(scenario.getAreaMatrixMap().get(areaId), preferredLanguage).getName();
            } catch (SymphonyStandardAppException e) {
                matrix = "<unknown>";
            }
            report.areaMatrices[am_ix++] = new ReportResponseDto.AreaMatrix(areaName, matrix);
        }

        report.normalization = scenario.getNormalization();
        report.impactPerPressure = impactPerComponent(scenario.getPressuresToInclude(), pTotal);
        report.impactPerEcoComponent = impactPerComponent(scenario.getEcosystemsToInclude(), esTotal);
        report.chartWeightThreshold =
            props.getPropertyAsDouble("calc.sankey_chart.link_weight_threshold", 0.001);
        if (computeChart)
            report.chartData = new SankeyChart(scenario.getEcosystemsToInclude(),
                scenario.getPressuresToInclude(), impactMatrix, total,
                report.chartWeightThreshold
            ).getChartData();

        report.geographicalArea =  JTS.transform(scenario.getGeometry(),
                CRS.findMathTransform(DefaultGeographicCRS.WGS84,
                    coverage.getCoordinateReferenceSystem2D())).getArea();


        report.scenarioChanges = scenario.getChangesForReport();
        report.timestamp = calc.getTimestamp().getTime();

        return report;
    }

    public double[][] calculateDifferentialImpactMatrix(double[][] imxA, double[][] imxB) {

        int pLen = imxA.length, esLen = imxA[0].length;
        double[][] diffs = new double[pLen][esLen];
        for (int b = 0; b < pLen; b++) {
            for (int e = 0; e < esLen; e++) {
                diffs[b][e] =  imxB[b][e] - imxA[b][e];
            }
        }

        return diffs;
    }

    public ComparisonReportResponseDto
        generateComparisonReportData(
            CalculationResult calcA,
            CalculationResult calcB,
            boolean implicit,
            boolean reverse,
            String preferredLanguage)
                throws FactoryException, TransformException, SymphonyStandardAppException, IOException {
        var report = new ComparisonReportResponseDto(generateReportData(calcA, false, preferredLanguage), generateReportData(calcB, false, preferredLanguage));

        if (implicit) {
            if(reverse) {
                report.getB().scenarioChanges = NullNode.getInstance();
            } else {
                report.getA().scenarioChanges = NullNode.getInstance();
            }
        }

        double chartWeightThreshold =
            props.getPropertyAsDouble("calc.sankey_chart.link_weight_threshold", 0.001);

        int[] ecoSystems = calcA.getScenarioSnapshot().getEcosystemsToInclude(),
              pressures  = calcA.getScenarioSnapshot().getPressuresToInclude();

        double[][] diffImpact = calculateDifferentialImpactMatrix(calcA.getImpactMatrix(), calcB.getImpactMatrix()),
                   diffImpactPositive = new double[diffImpact.length][diffImpact[0].length],
                   diffImpactNegative = new double[diffImpact.length][diffImpact[0].length];

        for (int b = 0; b < diffImpact.length; b++) {
            for (int e = 0; e < diffImpact[0].length; e++) {
                if (diffImpact[b][e] > 0) {
                    diffImpactPositive[b][e] = diffImpact[b][e];
                }
                if (diffImpact[b][e] < 0) {
                    diffImpactNegative[b][e] = Math.abs(diffImpact[b][e]);
                }
            }
        }

        double totalPositive = Arrays.stream(diffImpactPositive).flatMapToDouble(Arrays::stream).sum(),
               totalNegative = Arrays.stream(diffImpactNegative).flatMapToDouble(Arrays::stream).sum();

        report.setChartDataPositive(
            new SankeyChart(ecoSystems, pressures, diffImpactPositive, totalPositive, chartWeightThreshold)
                .getChartData());

        report.setChartDataNegative(
            new SankeyChart(ecoSystems, pressures, diffImpactNegative, totalNegative, chartWeightThreshold)
                .getChartData());

        return report;
    }

    private SymphonyBandDto[] flattenAndSort(MetadataComponentDto component) {
        return component.getSymphonyThemes().stream()
            .flatMap(theme -> theme.getBands().stream()).sorted(
                Comparator.comparingInt(SymphonyBandDto::getBandNumber))
            .toArray(SymphonyBandDto[]::new);
    }

    static int[] uniqueIntersection(int[] a, int[] b) {
        Set<Integer> s_a = Arrays.stream(a).boxed().collect(Collectors.toSet()),
                     s_b = Arrays.stream(b).boxed().collect(Collectors.toSet());
        s_a.retainAll(s_b);
        return s_a.stream().mapToInt(i -> i).toArray();
    }

    static final String rptRowFormat = "%s" + CSV_FIELD_SEPARATOR + "%.2f%%";

    public String generateCSVReport(CalculationResult calc, Locale locale) throws SymphonyStandardAppException {
        var metadata = metaDataService.findMetadata(calc.getBaselineVersion().getName(), locale.getLanguage(), true);
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
            writeReportRows(locale, pressureMetadata, featuredPressures, pTotal, total, writer);
            writer.println();

            // Impact per pressure
            writer.println("ECOSYSTEM" + CSV_FIELD_SEPARATOR + "Impact per Ecosystem");
            writeReportRows(locale, ecocomponentMetadata, featuredEcosystems, esTotal, total, writer);
        }
        string.flush();
        return string.toString();
    }

    static final String cmpRowFormat = "%s" + CSV_FIELD_SEPARATOR + "%.2f" + CSV_FIELD_SEPARATOR + "%.2f" + CSV_FIELD_SEPARATOR + "%.2f%%";

    public String generateCSVComparisonReport(CalculationResult calcA, CalculationResult calcB, Locale locale) throws SymphonyStandardAppException {
        MetadataDto metadata = metaDataService.findMetadata(calcA.getBaselineVersion().getName(), locale.getLanguage(), true);
        SymphonyBandDto[]   ecocomponentMetadata = flattenAndSort(metadata.getEcoComponent()),
                                pressureMetadata = flattenAndSort(metadata.getPressureComponent());

        ScenarioSnapshot scenarioA = calcA.getScenarioSnapshot(), scenarioB = calcB.getScenarioSnapshot();
        int[] featuredEcosystems = uniqueIntersection(  scenarioA.getEcosystemsToInclude(),
                                                        scenarioB.getEcosystemsToInclude()),
              featuredPressures = uniqueIntersection(   scenarioA.getPressuresToInclude(),
                                                        scenarioB.getPressuresToInclude());

        double[][] impactMatrixA = calcA.getImpactMatrix(), impactMatrixB = calcB.getImpactMatrix();
        double[] pTotalA = new double[impactMatrixA.length], pTotalB = new double[impactMatrixB.length];
        double[] esTotalA = new double[impactMatrixA[0].length], esTotalB = new double[impactMatrixB[0].length];
        double totalA = getComponentTotals(impactMatrixA, pTotalA, esTotalA),
               totalB = getComponentTotals(impactMatrixB, pTotalB, esTotalB),
               totalDiff = totalB - totalA;

        StringWriter string = new StringWriter();

        try (PrintWriter writer = new PrintWriter(string)) {
            writer.println("Comparing:"                     + CSV_FIELD_SEPARATOR +
                "\"" +  calcA.getCalculationName() + "\""   + CSV_FIELD_SEPARATOR +
                "\"" +  calcB.getCalculationName() + "\""   + CSV_FIELD_SEPARATOR);

            writer.println();
            writer.println("TOTAL" +
                            CSV_FIELD_SEPARATOR + "Total impact (Scenario A)" +
                            CSV_FIELD_SEPARATOR + "Total impact (Scenario B)" +
                            CSV_FIELD_SEPARATOR + "Relative change");
            writer.format(locale, cmpRowFormat, "All", totalA, totalB, totalDiff == 0 ? 0 : 100 * (totalDiff / totalA));

            writer.println();
            writer.println();
            writer.println("PRESSURE" +
                            CSV_FIELD_SEPARATOR + "Impact per Pressure (Scenario A)" +
                            CSV_FIELD_SEPARATOR + "Impact per Pressure (Scenario B)" +
                            CSV_FIELD_SEPARATOR + "Relative change");

            writeComparisonRows(locale, pressureMetadata, featuredPressures, pTotalA, pTotalB, writer);

            writer.println();
            writer.println("ECOSYSTEM" +
                CSV_FIELD_SEPARATOR + "Impact per Ecosystem (Scenario A)" +
                CSV_FIELD_SEPARATOR + "Impact per Ecosystem (Scenario B)" +
                CSV_FIELD_SEPARATOR + "Relative change");

            writeComparisonRows(locale, ecocomponentMetadata, featuredEcosystems, esTotalA, esTotalB, writer);
        }
        string.flush();
        return string.toString();
    }

    static void writeReportRows(Locale locale, SymphonyBandDto[] meta, int[] featured, double[] total, double sum, PrintWriter writer) {
        IntStream.range(0, featured.length).forEach(i -> {
            writer.format(locale, rptRowFormat,
                meta[featured[i]].getTitle(),
                sum == 0 ? 0 : 100 * (total[i] / sum));
            writer.println();
        });
    }

    static void writeComparisonRows(Locale locale, SymphonyBandDto[] meta, int[] featured, double[] totalA, double[] totalB, PrintWriter writer) {
        IntStream.range(0, featured.length).forEach(i -> {
                writer.format(locale, cmpRowFormat,
                    meta[featured[i]].getTitle(), totalA[i], totalB[i],
                    totalA[i] == 0 ? 0 : 100 * ((totalB[i] - totalA[i]) / totalA[i]));
                writer.println();
        });
    }

    public MultiComparisonAuxiliary getLayerIndicesToListForResult(ComparisonResult result, boolean excludeZeroes) {
        int[] ecosystemsToList = excludeZeroes ? IntStream.range(0, result.getIncludedEcosystems().length)
            .filter(i -> result.getTotalPerEcosystem().get(result.getIncludedEcosystems()[i]).totalDifference() != 0)
            .toArray() : IntStream.range(0, result.getIncludedEcosystems().length).toArray();

        int[] pressuresToList = excludeZeroes ? IntStream.range(0, result.getIncludedPressures().length)
            .filter(i -> result.getTotalPerPressure().get(result.getIncludedPressures()[i]).totalDifference() != 0)
            .toArray() : IntStream.range(0, result.getIncludedPressures().length).toArray();

        double[][] baselineMatrix = new double[pressuresToList.length][ecosystemsToList.length],
                   resultMatrix = new double[pressuresToList.length][ecosystemsToList.length];

        for (int p = 0; p < pressuresToList.length; p++) {
            for (int e = 0; e < ecosystemsToList.length; e++) {
                resultMatrix[p][e] = result.getResult()[pressuresToList[p]]
                    [ecosystemsToList[e]];
                baselineMatrix[p][e] = result.getResult()[pressuresToList[p]]
                    [ecosystemsToList[e]];
            }
        }

        return new MultiComparisonAuxiliary(ecosystemsToList, pressuresToList, baselineMatrix, resultMatrix);
    }

    public CompoundComparisonExport generateMultiComparisonAsJSON(
        CompoundComparison comparison, String preferredLanguage, boolean excludeZeroes) {

        BaselineVersion baseline = em.createNamedQuery("BaselineVersion.getById", BaselineVersion.class)
            .setParameter("id", comparison.getBaseline().getId())
            .getSingleResult();

        Map<Integer, String>
            ecoTitles = metaDataService.getSingleMetaFieldForComponent(
                comparison.getBaseline().getId(),
                LayerType.ECOSYSTEM,"title" , preferredLanguage),
            pressureTitles = metaDataService.getSingleMetaFieldForComponent(
                comparison.getBaseline().getId(),
                LayerType.PRESSURE,"title" , preferredLanguage);

        ComparisonResult[] cmpResults = excludeZeroes ?
            comparison.getResult().values().stream()
                .filter(c -> c.getCumulativeTotal() != 0)
                .toArray(ComparisonResult[]::new) :
            comparison.getResult().values().toArray(new ComparisonResult[0]);

        MultiComparisonAuxiliary[] layersToList = new MultiComparisonAuxiliary[cmpResults.length];

        for (int i = 0; i < cmpResults.length; ++i) {
            layersToList[i] = getLayerIndicesToListForResult(cmpResults[i], excludeZeroes);
        }

        return new CompoundComparisonExport(
            comparison.getId(),
            baseline.getName(),
            comparison.getName(),
            IntStream.range(0, cmpResults.length)
                .mapToObj(i -> {
                    ComparisonResultExport cmpResult = new ComparisonResultExport();
                    cmpResult.setCalculationName(cmpResults[i].getCalculationName());
                    cmpResult.setEcosystemTitles(Arrays.stream(layersToList[i].ecosystems)
                        .mapToObj(e -> ecoTitles.get(cmpResults[i].getIncludedEcosystems()[e]))
                        .toArray(String[]::new));
                    cmpResult.setPressureTitles(Arrays.stream(layersToList[i].pressures)
                        .mapToObj(p -> pressureTitles.get(cmpResults[i].getIncludedPressures()[p]))
                        .toArray(String[]::new));
                    cmpResult.setComparisonMatrix(layersToList[i].result);
                    cmpResult.setBaselineMatrix(layersToList[i].baseline);
                    cmpResult.setCumulativeTotalBaseline(cmpResults[i].getCumulativeTotal());
                    cmpResult.setCumulativeTotalDifference(cmpResults[i].getCumulativeTotalDiff());

                    return cmpResult;

                }).toArray(ComparisonResultExport[]::new));
    }

    private Sheet createSheet(int rows, int cols, String title) {
        Sheet newSheet = new Sheet(sanitizeSheetName(title), rows, Math.max(cols * 2 + 4, 6));

        Range titleCell = newSheet.getRange(1, 2, 1, 1);

        titleCell.setValue(title);
        titleCell.setStyle(ODSStyles.cmpName);

        newSheet.setRowHeight(1, 14.0);
        newSheet.setColumnWidth(0, 5.0);

        return newSheet;
    }

    public byte[] generateMultiComparisonAsODS(
        CompoundComparison comparison, String preferredLanguage,
        boolean excludeZeroes, boolean includeCombinedSheet,
        Map<String, String> localizedMeta) throws Exception {

        HashMap<String, String> metaDict = new HashMap<>(defaultMeta);

        metaDict.putAll(localizedMeta);

        String title = metaDict.get("compoundHeading") + " \"" + comparison.getName() + "\"",
            sum_s = metaDict.get("sum"), diff_s = metaDict.get("difference"),
            baseline_s = metaDict.get("baseline");

        Map<Integer, String>
            ecoTitles = metaDataService.getSingleMetaFieldForComponent(
                comparison.getBaseline().getId(),
                LayerType.ECOSYSTEM, "title", preferredLanguage),
            pressureTitles = metaDataService.getSingleMetaFieldForComponent(
                comparison.getBaseline().getId(),
                LayerType.PRESSURE,"title", preferredLanguage);

        SpreadSheet templateDocument = new SpreadSheet();

        ComparisonResult[] cmpResults =
            excludeZeroes ?
                comparison.getResult().values().stream()
                    .filter(cmp -> cmp.getCumulativeTotal() != 0)
                    .toArray(ComparisonResult[]::new) :
            comparison.getResult().values().toArray(new ComparisonResult[comparison.getResult().size()]);

        Sheet totalSheet = createSheet(
            cmpResults.length * ODF_CALC_TOTALS_SECTION + ODF_TITLE_ROWS_TOTAL, 1,
            title);

        totalSheet.setName(String.format("%s - %s", comparison.getName(), metaDict.get("total")));
        totalSheet.setColumnWidth(1, ODF_TITLE_COLWIDTH);

        // guard against duplicate calculation names
        Map<String, Integer> cmpNameCounts = new HashMap<>();

        for(ComparisonResult cmp : cmpResults) {
            cmpNameCounts.put(cmp.getCalculationName(), 0);
        }

        // Semantically consistent index variables.
        int e, p, j, cmpIndex = 0;
        int prevSectionLength = 0;

        for (ComparisonResult cmp : cmpResults) {

            String areaText = cmp.isPlanar() ? String.format("%s: %.2f km²", metaDict.get("area"), cmp.getArea_m2() / 1e6) :
                              String.format("%s: - (%s)", metaDict.get("area"), metaDict.get("nonPlanar")),
                   pixelsText = String.format("%s: %d", metaDict.get("pixels"), cmp.getStatisticsBaseline().pixels());

            Sheet nextSheet = createSheet(
                ODF_TABLE_VERTICAL_OFFSET + cmp.getIncludedEcosystems().length + 1, // +1 : including totals row
                cmp.getIncludedPressures().length,
                title);

            cmpNameCounts.put(cmp.getCalculationName(), cmpNameCounts.get(cmp.getCalculationName()) + 1);

            nextSheet.setName(cmp.getCalculationName() +
                (cmpNameCounts.get(cmp.getCalculationName()) > 1 ?
                " (" + cmpNameCounts.get(cmp.getCalculationName()) + ")" : ""));

            setCellValueAndStyle(nextSheet.getRange(3, 1), cmp.getCalculationName(), ODSStyles.calcName);


            nextSheet.getRange(4, 1).setValue(areaText);
            nextSheet.getRange(5, 1).setValue(pixelsText);

            nextSheet.setRowHeight(ODF_COLUMN_HEADING_ROW - 1, 2.0); // single contracted row above table

            MultiComparisonAuxiliary layersToList = getLayerIndicesToListForResult(cmp, excludeZeroes);

            setCellValueAndStyle(nextSheet.getRange(ODF_COLUMN_SUBHEADING_ROW, ODF_ROW_HEADING_COLUMN),
                null, ODSStyles.thickRightBorder);

            for (e = 0; e < layersToList.ecosystems.length; e++) {
                setCellValueAndStyle(nextSheet.getRange(ODF_TABLE_VERTICAL_OFFSET + e, ODF_ROW_HEADING_COLUMN),
                    ecoTitles.get(cmp.getIncludedEcosystems()[layersToList.ecosystems[e]]), ODSStyles.ecoHeader);
            }

            nextSheet.setColumnWidth(1, ODF_TITLE_COLWIDTH);

            if (layersToList.result.length == 0) {
                continue;
            }

            for (p = 0; p < layersToList.pressures.length; p++) {
                setCellValueAndStyle(
                    nextSheet.getRange(ODF_COLUMN_HEADING_ROW, ODF_TABLE_HORIZONTAL_OFFSET + p * 2),
                    pressureTitles.get(cmp.getIncludedPressures()[layersToList.pressures[p]]), ODSStyles.pressureHeaderLeft);
                setCellValueAndStyle(
                    nextSheet.getRange(ODF_COLUMN_HEADING_ROW, ODF_TABLE_HORIZONTAL_OFFSET + p * 2 + 1),
                    null, ODSStyles.pressureHeaderRight);
                setCellValueAndStyle(
                    nextSheet.getRange(ODF_COLUMN_SUBHEADING_ROW, ODF_TABLE_HORIZONTAL_OFFSET + p * 2),
                    baseline_s, ODSStyles.singleSubHeader);
                setCellValueAndStyle(
                    nextSheet.getRange(ODF_COLUMN_SUBHEADING_ROW, ODF_TABLE_HORIZONTAL_OFFSET + p * 2 + 1),
                    diff_s, ODSStyles.singleSubHeader);
                nextSheet.setColumnWidth(ODF_TABLE_HORIZONTAL_OFFSET + p * 2, ODF_TITLE_COLWIDTH);
                nextSheet.setColumnWidth(ODF_TABLE_HORIZONTAL_OFFSET + p * 2 + 1, ODF_TITLE_COLWIDTH);
            }

            for (e = 0; e < layersToList.result[0].length; e++) {
                for (p = 0; p < layersToList.result.length; p++) {
                    setCellValueAndStyle(
                        nextSheet.getRange(ODF_TABLE_VERTICAL_OFFSET + e,
                            ODF_TABLE_HORIZONTAL_OFFSET + p * 2),
                        layersToList.baseline[p][e], ODSStyles.valueStyle);
                    setCellValueAndStyle(
                        nextSheet.getRange(ODF_TABLE_VERTICAL_OFFSET + e,
                            ODF_TABLE_HORIZONTAL_OFFSET + p * 2 + 1),
                        layersToList.result[p][e], ODSStyles.valueStyle);
                }
            }

            setCellValueAndStyle(
                nextSheet.getRange(ODF_COLUMN_HEADING_ROW,
                    ODF_TABLE_HORIZONTAL_OFFSET + layersToList.pressures.length * 2),
                metaDict.get("total").toUpperCase(), ODSStyles.totalHE);
            setCellValueAndStyle(
                nextSheet.getRange(ODF_COLUMN_HEADING_ROW,
                    ODF_TABLE_HORIZONTAL_OFFSET+ layersToList.pressures.length * 2 + 1),
                null, ODSStyles.pressureHeaderRight);
            setCellValueAndStyle(
                nextSheet.getRange(ODF_COLUMN_SUBHEADING_ROW,
                    ODF_TABLE_HORIZONTAL_OFFSET + layersToList.pressures.length * 2),
                baseline_s, ODSStyles.singleSumSubHeader);
            setCellValueAndStyle(
                nextSheet.getRange(ODF_COLUMN_SUBHEADING_ROW,
                    ODF_TABLE_HORIZONTAL_OFFSET + layersToList.pressures.length * 2 + 1),
                diff_s, ODSStyles.singleSubHeader);

            nextSheet.setColumnWidth(ODF_TABLE_HORIZONTAL_OFFSET + layersToList.pressures.length * 2, ODF_TITLE_COLWIDTH);
            nextSheet.setColumnWidth(ODF_TABLE_HORIZONTAL_OFFSET + layersToList.pressures.length * 2 + 1, ODF_TITLE_COLWIDTH);

            setCellValueAndStyle(
                nextSheet.getRange(ODF_TABLE_VERTICAL_OFFSET + layersToList.ecosystems.length, ODF_ROW_HEADING_COLUMN),
                metaDict.get("total").toUpperCase(), ODSStyles.totalHP);

            for (e = 0; e < layersToList.ecosystems.length; e++) {
                setCellValueAndStyle(
                    nextSheet.getRange(ODF_TABLE_VERTICAL_OFFSET + e,
                        ODF_TABLE_HORIZONTAL_OFFSET + layersToList.pressures.length * 2),
                    cmp.getTotalPerEcosystem().get(cmp.getIncludedEcosystems()[layersToList.ecosystems[e]]).totalBaseline(), ODSStyles.totalE);
                setCellValueAndStyle(
                    nextSheet.getRange(ODF_TABLE_VERTICAL_OFFSET + e,
                        ODF_TABLE_HORIZONTAL_OFFSET + layersToList.pressures.length * 2 + 1),
                    cmp.getTotalPerEcosystem().get(cmp.getIncludedEcosystems()[layersToList.ecosystems[e]]).totalDifference(), ODSStyles.totalE2);
            }

            for (p = 0; p < layersToList.pressures.length; p++) {
                setCellValueAndStyle(
                    nextSheet.getRange(ODF_TABLE_VERTICAL_OFFSET + layersToList.ecosystems.length,
                        ODF_TABLE_HORIZONTAL_OFFSET + p * 2),
                    cmp.getTotalPerPressure().get(cmp.getIncludedPressures()[layersToList.pressures[p]]).totalBaseline(), ODSStyles.totalP);
                setCellValueAndStyle(
                    nextSheet.getRange(ODF_TABLE_VERTICAL_OFFSET + layersToList.ecosystems.length,
                        ODF_TABLE_HORIZONTAL_OFFSET + p * 2 + 1),
                    cmp.getTotalPerPressure().get(cmp.getIncludedPressures()[layersToList.pressures[p]]).totalDifference(), ODSStyles.totalP);
            }

            setCellValueAndStyle(
                nextSheet.getRange(
                    ODF_TABLE_VERTICAL_OFFSET + layersToList.ecosystems.length,
                    ODF_TABLE_HORIZONTAL_OFFSET + layersToList.pressures.length * 2),
                cmp.getCumulativeTotal(), ODSStyles.totalC);

            setCellValueAndStyle(
                nextSheet.getRange(
                    ODF_TABLE_VERTICAL_OFFSET + layersToList.ecosystems.length,
                    ODF_TABLE_HORIZONTAL_OFFSET + layersToList.pressures.length * 2 + 1),
                cmp.getCumulativeTotalDiff(), ODSStyles.totalC2);

            // ----- Totals sheet -----

            int calcSectionOffset = cmpIndex * ODF_CALC_TOTALS_SECTION + ODF_TITLE_ROWS_TOTAL,
                sectionLength = Math.max(layersToList.pressures.length, layersToList.ecosystems.length);
            totalSheet.appendColumns(sectionLength * 2 + 1);

            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset, 1),
                cmp.getCalculationName(), ODSStyles.calcName);

            totalSheet.getRange(calcSectionOffset + 1, 1)
                .setValue(areaText);
            totalSheet.getRange(calcSectionOffset + 2, 1)
                .setValue(pixelsText);

            // Left aligned table with row titles column in third column (index 2)
            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset, 2),
                metaDict.get("pressure"), ODSStyles.onlyBold);
            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 1, 2),
                null, ODSStyles.thickRightBorder);
            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 2, 2),
                sum_s.toUpperCase(), ODSStyles.totalHP);

            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 4, 2),
                metaDict.get("ecosystem"), ODSStyles.onlyBold);
            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 5, 2),
                null, ODSStyles.thickRightBorder);
            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 6, 2),
                sum_s.toUpperCase(), ODSStyles.totalHP);

            // Left aligned table with horizontal title column in third column:
            // values start in fourth column, hence index + 3
            for (p = 0; p < layersToList.pressures.length; p++) {
                setCellValueAndStyle(totalSheet.getRange(calcSectionOffset, 3 + p * 2),
                    pressureTitles.get(cmp.getIncludedPressures()[layersToList.pressures[p]]), ODSStyles.totalHeaderLeft);
                setCellValueAndStyle(totalSheet.getRange(calcSectionOffset, 3 + p * 2 + 1),
                    null, ODSStyles.totalHeaderRight);
                setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 1, 3 + p * 2),
                    baseline_s, ODSStyles.totalSubHeader);
                setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 1, 3 + p * 2 + 1),
                    diff_s, ODSStyles.totalSubHeader);
                setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 2, 3 + p * 2),
                    cmp.getTotalPerPressure().get(cmp.getIncludedPressures()[layersToList.pressures[p]]).totalBaseline(),
                    ODSStyles.totalP);
                setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 2, 3 + p * 2 + 1),
                    cmp.getTotalPerPressure().get(cmp.getIncludedPressures()[layersToList.pressures[p]]).totalDifference(),
                    ODSStyles.totalP);
            }

            for (e = 0; e < layersToList.ecosystems.length; e++) {
                setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 4, 3 + e * 2),
                    ecoTitles.get(cmp.getIncludedEcosystems()[layersToList.ecosystems[e]]), ODSStyles.totalHeaderLeft);
                setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 4, 3 + e * 2 + 1),
                    null, ODSStyles.totalHeaderRight);
                setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 5, 3 + e * 2),
                    baseline_s, ODSStyles.totalSubHeader);
                setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 5, 3 + e * 2 + 1),
                    diff_s, ODSStyles.totalSubHeader);
                setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 6, 3 + e * 2),
                    cmp.getTotalPerEcosystem().get(cmp.getIncludedEcosystems()[layersToList.ecosystems[e]]).totalBaseline(),
                    ODSStyles.totalP);
                setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 6, 3 + e * 2 + 1),
                    cmp.getTotalPerEcosystem().get(cmp.getIncludedEcosystems()[layersToList.ecosystems[e]]).totalDifference(),
                    ODSStyles.totalP);
            }

            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 8, 2),
                metaDict.get("total"), ODSStyles.onlyBold);
            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 9, 2),
                baseline_s, ODSStyles.totalHP);
            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 10, 2),
                diff_s, ODSStyles.totalHP);

            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 8, 3),
                sum_s, ODSStyles.pressureHeaderRight);
            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 9, 3),
                cmp.getCumulativeTotal(), ODSStyles.totalP);
            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 10, 3),
                cmp.getCumulativeTotalDiff(), ODSStyles.totalP2);

            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 8, 4),
                metaDict.get("average"), ODSStyles.pressureHeaderRight);
            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 9, 4),
                cmp.getStatisticsBaseline().average(), ODSStyles.totalP);
            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 10, 4),
                cmp.getStatisticsDiff().average(), ODSStyles.totalP2);

            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 8, 5),
                metaDict.get("max"), ODSStyles.pressureHeaderRight);
            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 9, 5),
                cmp.getStatisticsBaseline().max(), ODSStyles.totalP);
            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 10, 5),
                cmp.getStatisticsDiff().max(), ODSStyles.totalP2);

            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 8, 6),
                metaDict.get("stddev"), ODSStyles.pressureHeaderRight);
            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 9, 6),
                cmp.getStatisticsBaseline().stddev(), ODSStyles.totalP);
            setCellValueAndStyle(totalSheet.getRange(calcSectionOffset + 10, 6),
                cmp.getStatisticsDiff().stddev(), ODSStyles.totalP2);

            if (cmpIndex < cmpResults.length) {
                j = 0;
                while (j < sectionLength) {
                    totalSheet.setColumnWidth(1 + (1 + j) * 2, ODF_TITLE_COLWIDTH);
                    totalSheet.setColumnWidth(1 + (1 + j) * 2 + 1, ODF_TITLE_COLWIDTH);
                    ++j;
                }
                if (cmpIndex > 0) {
                    setCellValueAndStyle(
                        totalSheet.getRange(calcSectionOffset - 1, 1, 1, 2 + prevSectionLength * 2),
                        null, ODSStyles.resultSep);
                }
                prevSectionLength = sectionLength;
            }

            templateDocument.appendSheet(nextSheet);
            ++cmpIndex;
        }

        templateDocument.addSheet(totalSheet, 0);

        if (includeCombinedSheet) {
            Map<Integer, String>
                ecoThemes = metaDataService.getSingleMetaFieldForComponent(
                comparison.getBaseline().getId(),
                LayerType.ECOSYSTEM, "symphonytheme", preferredLanguage),
                pressureThemes = metaDataService.getSingleMetaFieldForComponent(
                comparison.getBaseline().getId(),
                LayerType.PRESSURE, "symphonytheme", preferredLanguage);

            templateDocument.addSheet(
                generateCombinedTable(comparison.getName(), cmpResults,
                    ecoTitles, pressureTitles, ecoThemes, pressureThemes,
                    metaDict, excludeZeroes), 1);
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        templateDocument.save(out);

        return out.toByteArray();
    }

    private Sheet generateCombinedTable(
        String comparisonTitle, ComparisonResult[] cmpResults,
        Map<Integer, String> ecoTitles, Map<Integer, String> pressureTitles,
        Map<Integer, String> ecoThemes, Map<Integer, String> pressureThemes,
        HashMap<String, String> metaDict, boolean excludeZeroes) {

        Sheet combinedSheet = new Sheet(comparisonTitle + " - " + metaDict.get("combined"),
            1, 9);
        int startRow = 1, px, ex;
        double baselineValue, resultValue;

        combinedSheet.setColumnWidths(0, 8, ODF_COMBO_VALUES);
        combinedSheet.setColumnWidth(0, ODF_COMBO_TITLES);
        combinedSheet.setColumnWidths(2, 4, ODF_COMBO_TITLES);

        setCellValueAndStyle(combinedSheet.getRange(0, 0),
            metaDict.get("scenarioTitle"), ODSStyles.comboHeader);
        setCellValueAndStyle(combinedSheet.getRange(0, 1),
            metaDict.get("area"), ODSStyles.comboHeader);
        setCellValueAndStyle(combinedSheet.getRange(0, 2),
            metaDict.get("pressure") + ", " + metaDict.get("theme"), ODSStyles.comboHeader);
        setCellValueAndStyle(combinedSheet.getRange(0, 3),
            metaDict.get("pressure"), ODSStyles.comboHeader);
        setCellValueAndStyle(combinedSheet.getRange(0, 4),
            metaDict.get("ecosystem")  + ", " + metaDict.get("theme"), ODSStyles.comboHeader);
        setCellValueAndStyle(combinedSheet.getRange(0, 5),
            metaDict.get("ecosystem"), ODSStyles.comboHeader);
        setCellValueAndStyle(combinedSheet.getRange(0, 6),
            metaDict.get("baseline"), ODSStyles.comboHeader);
        setCellValueAndStyle(combinedSheet.getRange(0, 7),
            metaDict.get("scenario"), ODSStyles.comboHeader);
        setCellValueAndStyle(combinedSheet.getRange(0, 8),
            metaDict.get("difference"), ODSStyles.comboHeader);

        for (ComparisonResult result : cmpResults) {
            MultiComparisonAuxiliary layersToList = getLayerIndicesToListForResult(result, excludeZeroes);
            combinedSheet.appendRows(layersToList.ecosystems.length * layersToList.pressures.length);

            for (int p = 0; p < layersToList.pressures.length; ++p) {
                px = result.getIncludedPressures()[layersToList.pressures[p]];
                for (int e = 0; e < layersToList.ecosystems.length; ++e) {
                    int row = startRow + layersToList.ecosystems.length * p + e;
                    ex = result.getIncludedEcosystems()[layersToList.ecosystems[e]];
                    baselineValue = layersToList.baseline[p][e];
                    resultValue = result.getResult()[p][e];
                    setCellValueAndStyle(combinedSheet.getRange(row, 0),
                        result.getCalculationName(), ODSStyles.comboTheme);
                    setCellValueAndStyle(combinedSheet.getRange(row, 1),
                        result.isPlanar() ? (int) Math.round(result.getArea_m2() / 1e6) :
                                        "N/A", ODSStyles.comboValue);
                    setCellValueAndStyle(combinedSheet.getRange(row, 2),
                        pressureThemes.get(px), ODSStyles.comboTheme);
                    setCellValueAndStyle(combinedSheet.getRange(row, 3),
                        pressureTitles.get(px), ODSStyles.comboValue);
                    setCellValueAndStyle(combinedSheet.getRange(row, 4),
                        ecoThemes.get(ex), ODSStyles.comboTheme);
                    setCellValueAndStyle(combinedSheet.getRange(row, 5),
                        ecoTitles.get(ex), ODSStyles.comboValue);
                    setCellValueAndStyle(combinedSheet.getRange(row, 6),
                        baselineValue, ODSStyles.comboValue);
                    setCellValueAndStyle(combinedSheet.getRange(row, 7),
                        baselineValue + resultValue, ODSStyles.comboValue);
                    setCellValueAndStyle(combinedSheet.getRange(row, 8),
                        resultValue, ODSStyles.comboValue);
                }
            }
            startRow += layersToList.ecosystems.length * layersToList.pressures.length;
        }

        return combinedSheet;
    }

    void setCellValueAndStyle(Range cell, Object value, Style style) {
        cell.setStyle(style);
        if (value != null) cell.setValue(value);
    }

    String sanitizeSheetName(String name) {
        return StringUtils.stripAccents(name).replaceAll("[/\\\\?*:\\[\\]]", "_");
    }
}
