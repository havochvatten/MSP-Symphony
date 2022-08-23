package se.havochvatten.symphony.calculation;

import it.geosolutions.jaiext.stats.Statistics;
import org.apache.commons.lang3.time.StopWatch;
import org.geotools.coverage.grid.GridCoverage2D;

import javax.ejb.EJB;
import javax.ejb.Startup;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.io.IOException;
import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.service.DataLayerService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Stateless
@Startup
public class CalibrationService {
    private static final Logger logger = LoggerFactory.getLogger(CalibrationService.class);

    @PersistenceContext(unitName = "symphonyPU")
    public EntityManager em;

    @EJB
    DataLayerService dataLayerService;

    @Inject
    private SymphonyCoverageProcessor processor;

    /**
     * Calculate baseline-global rarity indices (or actually its inverse, i.e.
     * commonness.
     * */
    public double[] calculateGlobalCommonnessIndices(GridCoverage2D ecoComponents, int[] ecosystemBands)
        throws SymphonyStandardAppException,
        IOException {

        logger.info("Calculating global rarity indices for coverage {}", ecoComponents.getName());
        var watch = new StopWatch();
        final var statsOp = processor.getOperation("Stats");

        var params = statsOp.getParameters();
        params.parameter("source").setValue(ecoComponents);
        params.parameter("bands").setValue(ecosystemBands);
        params.parameter("stats").setValue(new Statistics.StatsType[]{Statistics.StatsType.SUM});
        watch.start();
        var result = (GridCoverage2D) processor.doOperation(params);
        var bandsStats = (Statistics[][]) result.getProperty("JAI-EXT.stats");
        watch.stop();

        logger.info("DONE. ({} ms)", watch.getTime());
        return Arrays.stream(bandsStats)
            .mapToDouble(stats -> (double)stats[0].getResult())
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
        var values = calculateGlobalCommonnessIndices(ecoComponents, bandNumbers);

        return IntStream.range(0, values.length).boxed()
            .collect(Collectors.toMap(bandTitles::get, i -> Double.valueOf(values[i])));
    }
}
