package se.havochvatten.symphony.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vladmihalcea.hibernate.type.array.IntArrayType;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.hibernate.annotations.TypeDefs;
import se.havochvatten.symphony.scenario.ScenarioSplitOptions;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.ArrayList;

@Entity
@TypeDefs({
    @TypeDef(name = "int-array", typeClass = IntArrayType.class),
    @TypeDef(name = "json", typeClass = JsonBinaryType.class)
})
@Table(name = "batchcalculation")
public class BatchCalculation {

    private static final ObjectMapper mapper = new ObjectMapper();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "batchcalc_id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "owner", nullable = false)
    private String owner;

    @Column(name = "execution_id")
    @ColumnDefault("NULL")
    private Integer executionId;

    @NotNull
    @Column(name = "entities", nullable = false)
    @Type(type = "int-array")
    private int[] entities;

    @Column(name = "calculated", nullable = false)
    @ColumnDefault("ARRAY[]::integer[]")
    @Type(type = "int-array")
    private int[] calculated = new int[0];

    @Column(name = "failed", nullable = false)
    @ColumnDefault("ARRAY[]::integer[]")
    @Type(type = "int-array")
    private int[] failed = new int[0];

    @NotNull
    @Column(name = "areas_calculation", nullable = false)
    private Boolean areasCalculation = false;

    @Column(name = "areas_options", columnDefinition = "json")
    @Type(type = "json")
    private JsonNode areasOptions;

    @Column(name = "alternative_bands")
    @Type(type = "com.vladmihalcea.hibernate.type.array.StringArrayType")
    private String[] alternativeBands;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public Integer getExecutionId() {
        return executionId;
    }

    public void setExecutionId(Integer executionId) {
        this.executionId = executionId;
    }

    public int[] getEntities() {
        return entities;
    }

    public void setEntities(int[] entities) {
        this.entities = entities;
    }

    public int[] getCalculated() {
        return calculated;
    }

    public void setCalculated(int[] calculated) {
        this.calculated = calculated;
    }

    public void setCalculated(ArrayList<Integer> calculated) { this.calculated = calculated.stream().mapToInt(i -> i).toArray(); }

    public int[] getFailed() { return failed; }

    public void setFailed(int[] failed) { this.failed = failed; }

    public void setFailed(ArrayList<Integer> failed) { this.failed = failed.stream().mapToInt(i -> i).toArray(); }

    public Boolean isAreasCalculation() { return areasCalculation; }

    public void setAreasCalculation(Boolean areasCalculation) { this.areasCalculation = areasCalculation; }

    public ScenarioSplitOptions getAreasOptions() {
        if (areasOptions == null) {
            return null;
        }
        return mapper.convertValue(areasOptions, ScenarioSplitOptions.class);
    }

    public void setAreasOptions(ScenarioSplitOptions areasOptions) {
        this.areasOptions = mapper.valueToTree(areasOptions);
    }

    public String[] getAlternativeBands() {
        return alternativeBands;
    }

    public void setAlternativeBands(String[] alternativeBands) {
        this.alternativeBands = alternativeBands;
    }
}
