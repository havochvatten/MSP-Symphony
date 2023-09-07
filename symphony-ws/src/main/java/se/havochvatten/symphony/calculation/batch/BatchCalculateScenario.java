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

import javax.batch.api.AbstractBatchlet;
import javax.batch.runtime.BatchRuntime;
import javax.batch.runtime.context.JobContext;
import javax.ejb.Stateful;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.inject.Inject;
import javax.inject.Named;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.websocket.*;
import java.net.URI;

@Stateful
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

    @PersistenceContext(unitName = "symphonyPU")
    private EntityManager em;

    private int batchCalculationId;

    private final BatchStatusBeacon statusBeacon    = new BatchStatusBeacon();
    private final WebSocketContainer sockets        = ContainerProvider.getWebSocketContainer();

    private BatchCalculation batchCalculation;
    private BatchCalculationDto batchCalculationDto;

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

    @Override
    public String process() {

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

        batchCalculation.setCalculated(batchCalculationDto.getCalculated());
        batchCalculation.setFailed(batchCalculationDto.getFailed());

        em.merge(batchCalculation);

        return "COMPLETED";
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
