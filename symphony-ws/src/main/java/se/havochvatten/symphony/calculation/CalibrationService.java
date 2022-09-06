package se.havochvatten.symphony.calculation;

import it.geosolutions.jaiext.stats.Statistics;
import it.geosolutions.jaiext.stats.StatisticsDescriptor;
import it.geosolutions.jaiext.zonal.ZonalStatsDescriptor;
import it.geosolutions.jaiext.zonal.ZoneGeometry;
import org.apache.commons.lang3.time.StopWatch;
import org.geotools.coverage.grid.GridCoverage2D;

import javax.ejb.*;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.awt.image.RenderedImage;
import java.io.IOException;
import java.util.Arrays;

import org.locationtech.jts.geom.Geometry;
import org.opengis.feature.simple.SimpleFeature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.service.DataLayerService;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.ConcurrentSkipListMap;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import javax.servlet.http.HttpServletRequest;

import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import se.havochvatten.symphony.dto.NormalizationType;
import se.havochvatten.symphony.entity.CalculationResult;
import se.havochvatten.symphony.scenario.Scenario;

import static javax.ejb.ConcurrencyManagementType.BEAN;

@ConcurrencyManagement(BEAN)
@Singleton
@Startup
public class CalibrationService {
    private static final Logger logger = LoggerFactory.getLogger(CalibrationService.class);

    @PersistenceContext(unitName = "symphonyPU")
    public EntityManager em;

    @EJB
    DataLayerService dataLayerService;

    private final SymphonyCoverageProcessor processor;

    @Inject
    private CalcService calcService;

    @Inject
    private NormalizerService normalizationFactory;

    private ConcurrentMap<Integer, double[]> globalIndicesCache = new ConcurrentSkipListMap<>();

    public CalibrationService() { this.processor = null; }

    @Inject
    public CalibrationService(SymphonyCoverageProcessor processor) {
        this.processor = processor;
    }

    /**
     * Calculate baseline-global rarity indices (or actually its inverse, i.e.
     * commonness.
     * */
    public double[] calculateGlobalCommonnessIndices(GridCoverage2D ecoComponents, int[] ecosystemBands,
                                                     int baselineId) {
        var allIndices = globalIndicesCache.computeIfAbsent(baselineId, id -> {
            logger.info("Calculating global rarity indices for coverage {}", ecoComponents.getName());
            var watch = new StopWatch();
            final var statsOp = processor.getOperation("Stats");

            var params = statsOp.getParameters();
            params.parameter("source").setValue(ecoComponents);
            params.parameter("bands").setValue(
                IntStream.range(0, ecoComponents.getNumSampleDimensions()).toArray());
            params.parameter("stats").setValue(new Statistics.StatsType[]{Statistics.StatsType.SUM});
            watch.start();
            var result = (GridCoverage2D) processor.doOperation(params);
            var bandsStats = (Statistics[][]) result.getProperty("JAI-EXT.stats");
            watch.stop();
            logger.info("DONE. ({} ms)", watch.getTime());

            return Arrays.stream(bandsStats)
                .mapToDouble(stats -> (double)stats[0].getResult())
                .toArray();
        });

        return Arrays.stream(ecosystemBands).mapToDouble(bandIndex -> allIndices[bandIndex]).toArray();
    }

    /**
     * Calculate local rarity indices (or actually its inverse, i.e. commonness)
     **/
    public double[] calculateLocalCommonnessIndices(GridCoverage2D ecoComponents, int[] ecosystemBands,
                                                    Geometry roi/*RenderedImage zones*/) {
        logger.info("Calculating local rarity indices for coverage {}", ecoComponents.getName());
        var watch = new StopWatch();
        final var statsOp = processor.getOperation("Zonal");

        var params = statsOp.getParameters();
        params.parameter("source").setValue(ecoComponents);
        params.parameter("bands").setValue(ecosystemBands);
        params.parameter("stats").setValue(new Statistics.StatsType[]{Statistics.StatsType.SUM});
        params.parameter("roi").setValue(roi); // JTS polygon geometry
        watch.start();
        var result = (GridCoverage2D) processor.doOperation(params);
        var zoneStats = (List<ZoneGeometry>)result.getProperty(ZonalStatsDescriptor.ZS_PROPERTY);
        var theZone = zoneStats.get(0);
        watch.stop();
        logger.info("DONE. ({} ms)", watch.getTime());

        return Arrays.stream(ecosystemBands).mapToDouble(bandIndex ->
                (double)theZone.getStatsPerBandNoClassifierNoRange(bandIndex)[0].getResult())
                .toArray();
    }

    /**
     * @return commonness values index by band title
     */
    public Map<String, Double> getGlobalCommonnessIndicesIndexedByTitle(BaselineVersion baseline) throws SymphonyStandardAppException, IOException {
        var ecoComponents = dataLayerService.getCoverage(LayerType.ECOSYSTEM, baseline.getId());

        // Get component titles in band number order
        List<String> bandTitles = em.createQuery("select c.title from Metadata c where c.baselineVersion.id = " +
            ":baselineVersionId and c.symphonyCategory = 'Ecosystem' order by c.bandNumber")
            .setParameter("baselineVersionId", baseline.getId())
            .getResultList();

        var bandNumbers = IntStream.range(0, ecoComponents.getNumSampleDimensions()).toArray();
        var values = calculateGlobalCommonnessIndices(ecoComponents, bandNumbers, baseline.getId());

        return IntStream.range(0, values.length).boxed()
            .collect(Collectors.toMap(bandTitles::get, i -> Double.valueOf(values[i])));
    }

    public double calcPercentileNormalizationValue(HttpServletRequest req, Scenario scenario) throws FactoryException, SymphonyStandardAppException, TransformException, IOException {
        CalculationResult result = calcService.calculateScenarioImpact(req, scenario);
        var coverage = result.getCoverage();

        PercentileNormalizer normalizer = (PercentileNormalizer) normalizationFactory.getNormalizer(NormalizationType.PERCENTILE);
        return normalizer.computeNthPercentileNormalizationValue(coverage);
    }
}
