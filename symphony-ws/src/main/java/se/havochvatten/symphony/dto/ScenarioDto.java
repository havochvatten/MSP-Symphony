package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.scenario.Scenario;

import java.io.IOException;
import java.util.Date;

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

    public JsonNode feature; // TODO Use custom deserializer to deserialize into SimpleFeature

    public JsonNode changes; // FeatureCollection

    public int[] ecosystemsToInclude;

    public int[] pressuresToInclude;

    public MatrixParameters matrix;

    public NormalizationOptions normalization;

    public Integer latestCalculation; // id

    public ScenarioDto() {}

    public ScenarioDto(Scenario s) {
        id = s.getId();
        owner = s.getOwner();
        timestamp = s.getTimestamp();
        baselineId = s.getBaselineId();
        name = s.getName();
        feature = s.getFeatureJson();
        changes = s.getChanges();
        ecosystemsToInclude = s.getEcosystemsToInclude();
        pressuresToInclude = s.getPressuresToInclude();
        try {
            matrix = s.getMatrix() == null ? null : mapper.treeToValue(s.getMatrix(), MatrixParameters.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        normalization = s.getNormalization();
        if (s.getLatestCalculation() != null)
            latestCalculation = s.getLatestCalculation().getId();
    }

    public static ScenarioDto createWithoutId(String name, BaselineVersion baseline,
                                              JsonNode polygon,
                                              NormalizationOptions normalization) throws IOException {
        var s = new ScenarioDto();
        s.name = name;
        s.feature = polygon;
        s.baselineId = baseline.getId();
        s.normalization = normalization;
        s.changes = mapper.readTree("{}");
        return s;
    }
}
