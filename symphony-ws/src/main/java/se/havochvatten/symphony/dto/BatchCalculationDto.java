package se.havochvatten.symphony.dto;

import se.havochvatten.symphony.entity.BatchCalculation;

import java.util.ArrayList;
import java.util.Arrays;

public class BatchCalculationDto {
    private final int id;
    private final int[] scenarios;
    private Integer[] reports;
    private ArrayList<Integer> calculated;
    private ArrayList<Integer> failed;

    private Integer currentScenario;

    private boolean cancelled = false;

    public BatchCalculationDto(BatchCalculation batchCalculation) {
        this.id = batchCalculation.getId();
        this.scenarios = batchCalculation.getScenarios();
        this.calculated = new ArrayList<>(Arrays.stream(batchCalculation.getCalculated()).boxed().toList());
        this.reports = new Integer[batchCalculation.getScenarios().length];
        setFailed(batchCalculation.getFailed());
    }

    public int getId() {
        return id;
    }

    public int[] getScenarios() {
        return scenarios;
    }

    public ArrayList<Integer> getCalculated() { return calculated; }

    public ArrayList<Integer> getFailed() { return failed; }

    public Integer[] getReports() { return reports; }

    public void setCurrentScenario(Integer currentScenario) {
        this.currentScenario = currentScenario;
    }

    public Integer getCurrentScenario() { return currentScenario; }

    public void setCancelled(boolean cancelled) {
        this.cancelled = cancelled;
    }

    public void setFailed(int[] failed) {
        this.failed = new ArrayList<>(Arrays.stream(failed).boxed().toList());
    }

    public boolean isCancelled() {
        return cancelled;
    }
}
