package se.havochvatten.symphony.dto;

import se.havochvatten.symphony.entity.AreaType;
import se.havochvatten.symphony.mapper.CalculationAreaMapper;

import java.util.ArrayList;
import java.util.List;

public class AreaTypeDto {

    private Integer id;
    private String atypeName;
    private List<CalculationAreaDto> calculationAreas;

    public AreaTypeDto() {
        calculationAreas = new ArrayList<>();
    }

    public AreaTypeDto(AreaType entity) {
        this.id = entity.getId();
        this.atypeName = entity.getAtypeName();
        calculationAreas = new ArrayList<>();
        if (entity.getCalculationAreas() != null) {
            entity.getCalculationAreas().stream().forEach(ca -> {
                CalculationAreaDto calculationaAreaDto = CalculationAreaMapper.mapToDto(ca);
                calculationAreas.add(calculationaAreaDto);
            });
        }
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getAtypeName() {
        return atypeName;
    }

    public void setAtypeName(String atypeName) {
        this.atypeName = atypeName;
    }

    public List<CalculationAreaDto> getCalculationAreas() {
        return calculationAreas;
    }

    public void setCalculationAreas(List<CalculationAreaDto> calculationAreas) {
        this.calculationAreas = calculationAreas;
    }
}
