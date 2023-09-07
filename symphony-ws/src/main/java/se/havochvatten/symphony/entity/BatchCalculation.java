package se.havochvatten.symphony.entity;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Null;
import javax.validation.constraints.Size;
import java.util.ArrayList;

@Entity
@Table(name = "batchcalculation")
@DynamicInsert
public class BatchCalculation {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "batchcalculation_id_gen")
    @SequenceGenerator(name = "batchcalculation_id_gen", sequenceName = "batch_seq", allocationSize = 1)
    @Column(name = "batchcalc_id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "owner", nullable = false)
    private String owner;

    @Column(name = "execution_id", nullable = true)
    @ColumnDefault("NULL")
    private Integer executionId;

    @NotNull
    @Column(name = "scenarios", nullable = false)
    @Type(type = "com.vladmihalcea.hibernate.type.array.IntArrayType")
    private int[] scenarios;

    @Column(name = "calculated", nullable = false)
    @ColumnDefault("ARRAY[]::integer[]")
    @Type(type = "com.vladmihalcea.hibernate.type.array.IntArrayType")
    private int[] calculated = new int[0];

    @Column(name = "failed", nullable = false)
    @ColumnDefault("ARRAY[]::integer[]")
    @Type(type = "com.vladmihalcea.hibernate.type.array.IntArrayType")
    private int[] failed = new int[0];

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

    public int[] getScenarios() {
        return scenarios;
    }

    public void setScenarios(int[] scenarios) {
        this.scenarios = scenarios;
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

}
