package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import se.havochvatten.symphony.calculation.CalcService;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.scenario.Scenario;

import java.io.IOException;
import java.util.Date;
import java.util.Map;

public class ScenarioDto {
    private static final ObjectMapper mapper = new ObjectMapper();

    public Integer id;

    public String owner; // only to be set from backend

    public Date timestamp; // only to be set from backend

    /////////////// Supplied by frontend

    // Ideally we would have a proper reference to the BaselineVersion entity here, but entails custom
    // deserializer which in turn needs reference to JPA entity manager (but can be solved vith custom
    // HandlerInstatiotor)
    public Integer baselineId;

    public String name;

    public JsonNode changes;

    public int[] ecosystemsToInclude;

    public int[] pressuresToInclude;

    public NormalizationOptions normalization;

    public int operation = CalcService.OPERATION_CUMULATIVE;

    public ScenarioAreaDto[] areas;

    public Map<String, String> operationOptions;

    public Integer latestCalculationId;

    public ScenarioDto() {}

    public ScenarioDto(Scenario s) {
        super();
        if(s == null)   // may happen in named query list comprehension
            return;
        id = s.getId();
        owner = s.getOwner();
        timestamp = s.getTimestamp();
        baselineId = s.getBaselineId();
        name = s.getName();
        changes = s.getChanges();
        ecosystemsToInclude = s.getEcosystemsToInclude();
        pressuresToInclude = s.getPressuresToInclude();
        normalization = s.getNormalization();
        operation = s.getOperation();
        operationOptions = mapper.convertValue(s.getOperationOptions(), Map.class);
        areas = s.getAreas().stream().map(sa -> new ScenarioAreaDto(sa, this.id)).toArray(ScenarioAreaDto[]::new);
        latestCalculationId = s.getLatestCalculation() == null ? null : s.getLatestCalculation().getId();
    }

    public static ScenarioDto createWithoutId(String name, BaselineVersion baseline,
                                              ScenarioAreaDto area,
                                              NormalizationOptions normalization) throws IOException {
        var s = new ScenarioDto();
        s.name = name;
        s.baselineId = baseline.getId();
        s.normalization = normalization;
        s.changes = mapper.readTree("{}");
        s.areas = new ScenarioAreaDto[] { area };
        return s;
    }
}
