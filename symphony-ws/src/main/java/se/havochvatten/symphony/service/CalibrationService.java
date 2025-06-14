package se.havochvatten.symphony.service;

import it.geosolutions.jaiext.stats.Statistics;
import org.apache.commons.lang3.time.StopWatch;
import org.geotools.coverage.grid.GridCoverage2D;

import jakarta.ejb.*;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.io.IOException;
import java.util.Arrays;

import org.opengis.feature.simple.SimpleFeature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.calculation.Operations;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.ConcurrentSkipListMap;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import se.havochvatten.symphony.dto.NormalizationType;
import se.havochvatten.symphony.entity.CalculationResult;
import se.havochvatten.symphony.entity.Scenario;
import se.havochvatten.symphony.service.normalizer.NormalizerService;
import se.havochvatten.symphony.service.normalizer.PercentileNormalizer;

import static jakarta.ejb.ConcurrencyManagementType.BEAN;

@ConcurrencyManagement(BEAN)
@Singleton
@Startup
public class CalibrationService {
    private static final Logger logger = LoggerFactory.getLogger(CalibrationService.class);

    private ConcurrentMap<Integer, double[]> globalIndicesCache = new ConcurrentSkipListMap<>();
    private final Operations operations;

    @PersistenceContext(unitName = "symphonyPU")
    public EntityManager em;

    @EJB
    DataLayerService dataLayerService;

    @Inject
    private CalcService calcService;

    @Inject
    private NormalizerService normalizationFactory;

    public CalibrationService() { this.operations = null; } // to satisfy CDI

    @Inject
    public CalibrationService(Operations ops) {
        this.operations = ops;
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
            watch.start();
            var bandsStats = operations.stats(ecoComponents,
                IntStream.range(0, ecoComponents.getNumSampleDimensions()).toArray(),
                new Statistics.StatsType[]{Statistics.StatsType.SUM});
            watch.stop();
            logger.info("DONE. ({} ms)", watch.getTime());

            return Arrays.stream(bandsStats)
                .mapToDouble(stats -> (double)stats[0].getResult())
                .toArray();
        });

        return Arrays.stream(ecosystemBands).mapToDouble(bandIndex -> allIndices[bandIndex]).toArray();
    }

    /**
     * Calculate local rarity indices (or actually its inverse, i.e. "commonness")
     **/
    public double[] calculateLocalCommonnessIndices(GridCoverage2D ecoComponents, int[] ecosystemBands,
                                                    List<SimpleFeature> zoneList) {
        logger.info("Calculating local rarity indices for coverage {}", ecoComponents.getName());
        // TODO: Cache indices? (based on feature hash?)
        var watch = new StopWatch();
        watch.start();
        var theZone = operations.zonalStats(ecoComponents, ecosystemBands,
            new Statistics.StatsType[]{ Statistics.StatsType.SUM }, zoneList);
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
        List<String> bandTitles =
            em.createQuery("select metaValue from Metadata m where m.band.baseline.id = :baselineId and " +
                "m.band.category = 'Ecosystem' and " +
                "m.metaField = 'title' order by m.band.bandnumber", String.class)
                .setParameter("baselineId", baseline.getId())
                .getResultList();

        var bandNumbers = IntStream.range(0, ecoComponents.getNumSampleDimensions()).toArray();
        var values = calculateGlobalCommonnessIndices(ecoComponents, bandNumbers, baseline.getId());

        return IntStream.range(0, values.length).boxed()
            .collect(Collectors.toMap(bandTitles::get, i -> values[i]));
    }

    public double calcPercentileNormalizationValue(Scenario scenario)
        throws FactoryException, SymphonyStandardAppException, TransformException, IOException {
        CalculationResult result = calcService.calculateScenarioImpact(scenario, false);
        var coverage = result.getCoverage();

        PercentileNormalizer normalizer = (PercentileNormalizer) normalizationFactory.getNormalizer(NormalizationType.PERCENTILE);
        return normalizer.computeNthPercentileNormalizationValue(coverage);
    }
}
