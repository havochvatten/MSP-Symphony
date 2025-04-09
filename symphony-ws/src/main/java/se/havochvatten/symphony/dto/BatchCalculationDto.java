package se.havochvatten.symphony.dto;

import se.havochvatten.symphony.entity.BatchCalculation;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class BatchCalculationDto {
    private final int id;
    private final int[] entities;
    private Integer[] reports;
    private ArrayList<Integer> calculated;
    private ArrayList<Integer> failed;

    private Integer currentEntity;

    private final Map<Integer, String> entityNames;

    private boolean cancelled = false;

    public BatchCalculationDto(BatchCalculation batchCalculation, Map<Integer, String> entityNames) {
        this.id = batchCalculation.getId();
        this.entities = batchCalculation.getEntities();
        this.calculated = new ArrayList<>(Arrays.stream(batchCalculation.getCalculated()).boxed().toList());
        this.reports = new Integer[batchCalculation.getEntities().length];
        this.entityNames = entityNames;
        setFailed(batchCalculation.getFailed());
    }

    public int getId() {
        return id;
    }

    public int[] getEntities() {
        return entities;
    }

    public List<Integer> getCalculated() { return calculated; }

    public List<Integer> getFailed() { return failed; }

    public Integer[] getReports() { return reports; }

    public void setCurrentEntity(Integer currentEntity) {
        this.currentEntity = currentEntity;
    }

    public Integer getCurrentEntity() { return currentEntity; }

    public void setCancelled(boolean cancelled) {
        this.cancelled = cancelled;
    }

    public void setFailed(int[] failed) {
        this.failed = new ArrayList<>(Arrays.stream(failed).boxed().toList());
    }

    public boolean isCancelled() {
        return cancelled;
    }

    public Map<Integer, String> getEntityNames() {
        return entityNames;
    }
}
