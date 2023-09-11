package se.havochvatten.symphony.calculation.batch;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import se.havochvatten.symphony.calculation.CalcService;
import se.havochvatten.symphony.dto.BatchCalculationDto;
import se.havochvatten.symphony.entity.BatchCalculation;
import se.havochvatten.symphony.entity.CalculationResult;
import se.havochvatten.symphony.scenario.Scenario;
import se.havochvatten.symphony.scenario.ScenarioService;
import se.havochvatten.symphony.service.PropertiesService;

import javax.annotation.Resource;
import javax.batch.api.AbstractBatchlet;
import javax.batch.runtime.BatchRuntime;
import javax.batch.runtime.context.JobContext;
import javax.ejb.*;
import javax.inject.Inject;
import javax.inject.Named;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.*;
import javax.websocket.*;
import java.net.URI;
import java.util.Arrays;

import static javax.ejb.LockType.READ;
import static javax.ejb.LockType.WRITE;

@Named
@TransactionAttribute(TransactionAttributeType.REQUIRED)
public class BatchCalculateScenario extends AbstractBatchlet {
    @Inject
    private JobContext jobContext;

    @Inject
    private PropertiesService properties;

    @Inject
    private CalcService calcService;

    @Inject
    private ScenarioService scenarioService;

    @Resource
    private UserTransaction transaction;

    @PersistenceContext(unitName = "symphonyPU")
    private EntityManager em;

    private int batchCalculationId;

    private final BatchStatusBeacon statusBeacon    = new BatchStatusBeacon();
    private final WebSocketContainer sockets        = ContainerProvider.getWebSocketContainer();

    private BatchCalculation batchCalculation;
    private BatchCalculationDto batchCalculationDto;

    private static volatile boolean cancelled = false;

    private static final ObjectMapper mapper = new ObjectMapper();

    private Session getSocketSession() {
        try {
            return sockets.connectToServer(statusBeacon,
                URI.create(properties.getProperty("socket.base_url") + "/symphony-ws/batch-status/" + this.batchCalculationId));
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private void dispatchStatus() {
        try {
            getSocketSession().getAsyncRemote().sendText(mapper.writeValueAsString(this.batchCalculationDto));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    // Concurrent R/W-locked get + set for the 'single point of failure'.
    // (note that parallel mishaps should be extremely unlikely without this measure)

    @Lock(READ)
    private static boolean isCancelled() {
        return BatchCalculateScenario.cancelled;
    }

    @Lock(WRITE)
    private static void setCancelled(boolean cancelled) {
        BatchCalculateScenario.cancelled = cancelled;
    }

    @Override
    public String process() throws Exception {
        batchCalculationId = Integer.parseInt(BatchRuntime.getJobOperator().
                getParameters( jobContext.getExecutionId() ).getProperty("batchCalculationId"));

        batchCalculation = em.find(BatchCalculation.class, batchCalculationId);
        batchCalculationDto = new BatchCalculationDto(batchCalculation);

        int[] scenarioIds = batchCalculation.getScenarios();

        Scenario currentScenario;

        for(int ix = 0; ix < scenarioIds.length; ++ix) {

            currentScenario = scenarioService.findById(scenarioIds[ix]);
            batchCalculationDto.setCurrentScenario(scenarioIds[ix]);
            dispatchStatus();

            if (isCancelled()) {
                setCancelled(false);
                int[] allFailed =
                        Arrays.stream(batchCalculation.getScenarios()).filter(
                                        scenarioId -> !batchCalculationDto.getCalculated().contains(scenarioId))
                                .toArray();

                batchCalculation.setFailed(allFailed);
                batchCalculationDto.setFailed(allFailed);
                batchCalculationDto.setCancelled(true);
                break;
            }

            try {
                CalculationResult calculationResult = calcService.calculateScenarioImpact(currentScenario);
                batchCalculationDto.getReports()[ix] = calculationResult.getId();
            } catch (Exception e) {
                batchCalculationDto.getFailed().add(scenarioIds[ix]);
                continue;
            }

            batchCalculationDto.getCalculated().add(scenarioIds[ix]);
        }

        batchCalculationDto.setCurrentScenario(null);
        dispatchStatus();

        persistBatchStatus();

        return isCancelled() ? "STOPPED" : "COMPLETED";
    }

    @Override
    public void stop() throws Exception {
        setCancelled(true);
    }

    public void persistBatchStatus() throws Exception {
        batchCalculation.setCalculated(batchCalculationDto.getCalculated());
        batchCalculation.setFailed(batchCalculationDto.getFailed());

        transaction.begin();
        em.merge(batchCalculation);
        transaction.commit();
    }

    @ClientEndpoint
    static class BatchStatusBeacon {
        private ClientEndpointConfig config;
        private Session session;

        @OnOpen
        public void onOpen(Session session, EndpointConfig endpointConfig) {
            this.config = (ClientEndpointConfig) endpointConfig;
            this.session = session;
        }
    }
}
