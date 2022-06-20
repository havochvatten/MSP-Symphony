package se.havochvatten.symphony.mapper;

import se.havochvatten.symphony.dto.CalcAreaSensMatrixDto;
import se.havochvatten.symphony.entity.CalcAreaSensMatrix;
import se.havochvatten.symphony.entity.CalculationArea;
import se.havochvatten.symphony.entity.SensitivityMatrix;

import java.util.ArrayList;
import java.util.List;

public class CalcAreaSensMatrixMapper {

    public static CalcAreaSensMatrix mapToEntity(CalcAreaSensMatrixDto calcAreaSensMatrixDto,
												 CalculationArea calculationArea,
												 SensitivityMatrix sensitivityMatrix) {
        CalcAreaSensMatrix calcAreaSensMatrix = new CalcAreaSensMatrix();
        calcAreaSensMatrix.setId(calcAreaSensMatrixDto.getId());
        calcAreaSensMatrix.setComment(calcAreaSensMatrixDto.getComment());
        calcAreaSensMatrix.setCalculationArea(calculationArea);
        calcAreaSensMatrix.setSensitivityMatrix(sensitivityMatrix);
        return calcAreaSensMatrix;
    }

    public static CalcAreaSensMatrixDto mapToDto(CalcAreaSensMatrix calcAreaSensMatrix) {
        CalcAreaSensMatrixDto calcAreaSensMatrixDto = new CalcAreaSensMatrixDto();
        calcAreaSensMatrixDto.setId(calcAreaSensMatrix.getId());
        calcAreaSensMatrixDto.setComment(calcAreaSensMatrix.getComment());
        calcAreaSensMatrixDto.setCalcareaId(calcAreaSensMatrix.getCalculationArea() == null ? null :
				calcAreaSensMatrix.getCalculationArea().getId());
        calcAreaSensMatrixDto.setSensmatrixId(calcAreaSensMatrix.getSensitivityMatrix() == null ? null :
				calcAreaSensMatrix.getSensitivityMatrix().getId());
        calcAreaSensMatrixDto.setAreaName(calcAreaSensMatrix.getCalculationArea() == null ? null :
				calcAreaSensMatrix.getCalculationArea().getName());
        calcAreaSensMatrixDto.setMatrixName(calcAreaSensMatrix.getSensitivityMatrix() == null ? null :
				calcAreaSensMatrix.getSensitivityMatrix().getName());
        return calcAreaSensMatrixDto;
    }

    public static List<CalcAreaSensMatrixDto> mapToDtos(List<CalcAreaSensMatrix> calcAreaSensMatrices) {
        List<CalcAreaSensMatrixDto> dtos = new ArrayList<>();
        calcAreaSensMatrices.forEach((ca) -> {
            dtos.add(mapToDto(ca));
        });
        return dtos;
    }
}
