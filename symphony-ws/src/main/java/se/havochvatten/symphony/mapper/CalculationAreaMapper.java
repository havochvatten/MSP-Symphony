package se.havochvatten.symphony.mapper;

import se.havochvatten.symphony.dto.CaPolygonDto;
import se.havochvatten.symphony.dto.CalculationAreaDto;
import se.havochvatten.symphony.entity.CaPolygon;
import se.havochvatten.symphony.entity.CalculationArea;
import se.havochvatten.symphony.entity.SensitivityMatrix;

import java.util.ArrayList;
import java.util.List;


public class CalculationAreaMapper {

    public static CalculationAreaDto mapToDto(CalculationArea calculationArea) {
        CalculationAreaDto calculationAreaDto = new CalculationAreaDto();
        calculationAreaDto.setId(calculationArea.getId());
        calculationAreaDto.setName(calculationArea.getName());
        calculationAreaDto.setCareaDefault(calculationArea.isCareaDefault());
        calculationAreaDto.setDefaultSensitivityMatrixId(calculationArea.getdefaultSensitivityMatrix() == null ? null : calculationArea.getdefaultSensitivityMatrix().getId());
        calculationAreaDto.getPolygons().addAll(mapPolygonToDto(calculationArea.getCaPolygonList()));
        return calculationAreaDto;
    }

    public static CalculationArea mapToEntity(CalculationAreaDto calculationAreaDto,
											  SensitivityMatrix sensitivityMatrix) {
        CalculationArea calculationArea = new CalculationArea();
        calculationArea.setId(calculationAreaDto.getId());
        calculationArea.setName(calculationAreaDto.getName());
        calculationArea.setCareaDefault(calculationAreaDto.isCareaDefault());
        calculationArea.setdefaultSensitivityMatrix(sensitivityMatrix);
        calculationArea.setCaPolygonList(mapPolygonToEntity(calculationAreaDto.getPolygons(),
				calculationArea));
        return calculationArea;
    }

    private static List<CaPolygon> mapPolygonToEntity(List<CaPolygonDto> caPolygonDtos,
													  CalculationArea calculationArea) {
        List<CaPolygon> caPolygons = new ArrayList<>();
        for (CaPolygonDto cap : caPolygonDtos) {
            CaPolygon caPolygon = new CaPolygon();
            caPolygon.setId(Integer.valueOf(0).equals(caPolygon.getId()) ? null : cap.getId());
            caPolygon.setCalculationArea(calculationArea);
            caPolygon.setPolygon(cap.getPolygon());
            caPolygons.add(caPolygon);
        }
        return caPolygons;
    }

    private static List<CaPolygonDto> mapPolygonToDto(List<CaPolygon> caPolygons) {
        List<CaPolygonDto> caPolygonDtos = new ArrayList<>();
        if (caPolygons == null) {
            return caPolygonDtos;
        }
        for (CaPolygon cap : caPolygons) {
            CaPolygonDto caPolygonDto = new CaPolygonDto();
            caPolygonDto.setId(cap.getId());
            caPolygonDto.setPolygon(cap.getPolygon());
            caPolygonDtos.add(caPolygonDto);
        }
        return caPolygonDtos;
    }

}
