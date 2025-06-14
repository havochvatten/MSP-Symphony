package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.databind.JsonNode;
import se.havochvatten.symphony.entity.ScenarioArea;

import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link ScenarioArea} entity
 */
public class ScenarioAreaDto implements Serializable {

    public final Integer id;
    private final JsonNode changes;
    private final JsonNode feature;
    private final JsonNode matrix;

    @NotNull
    private final Integer scenarioId;
    private final Integer excludedCoastal;

    private final Integer customCalcAreaId;

    public ScenarioAreaDto() {
        id = 0;
        changes = null;
        feature = null;
        matrix = null;
        scenarioId = 0;
        excludedCoastal = null;
        customCalcAreaId = null;
    }

    public ScenarioAreaDto(ScenarioArea area, Integer scenarioId) {
        this.id = area.getId();
        this.changes = area.getChanges();
        this.feature = area.getFeatureJson();
        this.matrix = area.getMatrix();
        this.scenarioId = scenarioId;
        this.excludedCoastal = area.getExcludedCoastal();
        this.customCalcAreaId = area.getCustomCalcArea() == null ? null :
                                area.getCustomCalcArea().getId();
    }

    public ScenarioAreaDto(Integer id, JsonNode changes, JsonNode feature, JsonNode matrix,
                           Integer scenarioId, Integer excludedCoastal, Integer customCalcAreaId) {
        this.id = id;
        this.changes = changes;
        this.feature = feature;
        this.matrix = matrix;
        this.scenarioId = scenarioId;
        this.excludedCoastal = excludedCoastal;
        this.customCalcAreaId = customCalcAreaId;
    }

    public Integer getId() {
        return id;
    }

    public JsonNode getChanges() {
        return changes;
    }

    public JsonNode getFeature() {
        return feature;
    }

    public JsonNode getMatrix() {
        return matrix;
    }

    public Integer getScenarioId() {
        return scenarioId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ScenarioAreaDto entity = (ScenarioAreaDto) o;
        return Objects.equals(this.id, entity.id) &&
            Objects.equals(this.changes, entity.changes) &&
            Objects.equals(this.feature, entity.feature) &&
            Objects.equals(this.matrix, entity.matrix) &&
            Objects.equals(this.scenarioId, entity.scenarioId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, changes, feature, matrix, scenarioId);
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + "(" +
            "id = " + id + ", " +
            "changes = " + changes + ", " +
            "feature = " + feature + ", " +
            "matrix = " + matrix + ", " +
            "scenarioId = " + scenarioId + ")";
    }

    public Integer getExcludedCoastal() {
        return excludedCoastal;
    }

    public Integer getCustomCalcAreaId() {
        return customCalcAreaId;
    }
}
