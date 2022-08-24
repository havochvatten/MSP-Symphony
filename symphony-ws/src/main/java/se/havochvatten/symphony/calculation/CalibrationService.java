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
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Context;

import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.dto.NormalizationType;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.entity.CalculationArea;
import se.havochvatten.symphony.entity.CalculationResult;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.scenario.Scenario;
import se.havochvatten.symphony.service.DataLayerService;

import java.io.IOException;


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

    @Inject
    private CalcService calcService;

    @Inject
    private NormalizerService normalizationFactory;

    /**
     *
     */
    public double calcPercentileNormalizationValue(HttpServletRequest req, Scenario scenario) throws FactoryException, SymphonyStandardAppException, TransformException, IOException {
        CalculationResult result = calcService.calculateScenarioImpact(req, scenario);
        var coverage = result.getCoverage();

        PercentileNormalizer normalizer = (PercentileNormalizer) normalizationFactory.getNormalizer(NormalizationType.PERCENTILE);
        return normalizer.computeNthPercentileNormalizationValue(coverage);
    }


}
