package se.havochvatten.symphony.calculation.batch;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import se.havochvatten.symphony.entity.Scenario;
import se.havochvatten.symphony.entity.ScenarioArea;
import se.havochvatten.symphony.service.CalcService;
import se.havochvatten.symphony.dto.BatchCalculationDto;
import se.havochvatten.symphony.entity.BatchCalculation;
import se.havochvatten.symphony.entity.CalculationResult;
import se.havochvatten.symphony.scenario.*;
import se.havochvatten.symphony.service.PropertiesService;
import se.havochvatten.symphony.service.ScenarioService;

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
import java.util.List;

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
            Session session = getSocketSession();
            if (session != null) {
                session.getAsyncRemote().sendText(mapper.writeValueAsString(this.batchCalculationDto));
            }
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
        batchCalculationDto = new BatchCalculationDto(batchCalculation, null);
        ScenarioSplitOptions areasOptions = batchCalculation.getAreasOptions();

        int[] ids = batchCalculation.getEntities();

        Scenario currentScenario;

        for (int ix = 0; ix < ids.length; ++ix) {
            if (batchCalculation.isAreasCalculation()) {
                ScenarioArea area = em.find(ScenarioArea.class, ids[ix]);
                ScenarioCopyOptions copyOptions = new ScenarioCopyOptions(area, areasOptions);
                copyOptions.areaChangesToInclude =
                    areasOptions.applyAreaChanges() ? new int[]{ area.getId() } : new int[0];
                currentScenario = new Scenario(area.getScenario(), copyOptions, List.of(area));
                currentScenario.getAreas().get(0).setId(area.getId());
            } else {
                currentScenario = scenarioService.findById(ids[ix]);
            }

            batchCalculationDto.setCurrentEntity(ids[ix]);
            dispatchStatus();

            if (isCancelled()) {
                setCancelled(false);
                int[] allFailed =
                        Arrays.stream(batchCalculation.getEntities()).filter(
                                        entityId -> !batchCalculationDto.getCalculated().contains(entityId))
                                .toArray();

                batchCalculation.setFailed(allFailed);
                batchCalculationDto.setFailed(allFailed);
                batchCalculationDto.setCancelled(true);
                break;
            }

            try {
                CalculationResult calculationResult =
                    calcService.calculateScenarioImpact(currentScenario, batchCalculation.isAreasCalculation());
                batchCalculationDto.getReports()[ix] = calculationResult.getId();
            } catch (Exception e) {
                batchCalculationDto.getFailed().add(ids[ix]);
                continue;
            }

            batchCalculationDto.getCalculated().add(ids[ix]);
        }

        batchCalculationDto.setCurrentEntity(null);
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
