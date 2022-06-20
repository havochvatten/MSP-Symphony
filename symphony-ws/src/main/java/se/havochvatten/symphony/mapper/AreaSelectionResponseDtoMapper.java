package se.havochvatten.symphony.mapper;

import se.havochvatten.symphony.dto.AreaSelectionResponseDto;
import se.havochvatten.symphony.entity.AreaType;
import se.havochvatten.symphony.entity.CalcAreaSensMatrix;
import se.havochvatten.symphony.entity.CalculationArea;
import se.havochvatten.symphony.entity.SensitivityMatrix;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;

import java.util.ArrayList;
import java.util.List;

public class AreaSelectionResponseDtoMapper {
    public static AreaSelectionResponseDto mapToDto(CalculationArea defaultArea,
													List<AreaSelectionResponseDto.AreaTypeArea> areaTypeDtos,
                                                    List<CalcAreaSensMatrix> userDefinedMatrices) throws SymphonyStandardAppException {
        AreaSelectionResponseDto resp = new AreaSelectionResponseDto();
        List<AreaSelectionResponseDto.Matrix> userDefinedMatrixDtos =
				mapToCalcAreaSensMatrixDtos(userDefinedMatrices, false);
        AreaSelectionResponseDto.DefaultArea defaultAreaDto = new AreaSelectionResponseDto.DefaultArea();
        defaultAreaDto.setAreaAttributes(mapToAreaDto(defaultArea));
        defaultAreaDto.getUserDefinedMatrices().addAll(userDefinedMatrixDtos);
        resp.setDefaultArea(defaultAreaDto);
        resp.getAreaTypes().addAll(areaTypeDtos);

        return resp;
    }

    public static AreaSelectionResponseDto.AreaTypeArea mapToAreaTypeDto(AreaType areaType,
																		 List<CalculationArea> calculationAreas) {
        AreaSelectionResponseDto.AreaTypeArea dto = new AreaSelectionResponseDto.AreaTypeArea();
        dto.setId(areaType.getId());
        dto.setName(areaType.getAtypeName());
        dto.setCoastalArea(areaType.isCoastalArea());
        dto.getAreas().addAll(mapToAreas(calculationAreas));
        return dto;
    }

    private static List<AreaSelectionResponseDto.Area> mapToAreas(List<CalculationArea> calculationAreas) {
        List<AreaSelectionResponseDto.Area> areaDtos = new ArrayList<>();
        calculationAreas.forEach(a -> {
            areaDtos.add(mapToAreaDto(a));
        });
        return areaDtos;
    }

    private static AreaSelectionResponseDto.Area mapToAreaDto(CalculationArea calculationArea) {
        AreaSelectionResponseDto.Area areaDto = new AreaSelectionResponseDto.Area();
        areaDto.setId(calculationArea.getId());
        areaDto.setName(calculationArea.getName());
        areaDto.setDefaultMatrix(mapSensitivityMatrixToDto(calculationArea.getdefaultSensitivityMatrix()));
        areaDto.getMatrices().addAll(mapToCalcAreaSensMatrixDtos(calculationArea.getCalcAreaSensMatrixList(), true));
        return areaDto;
    }

    private static List<AreaSelectionResponseDto.Matrix> mapToCalcAreaSensMatrixDtos(List<CalcAreaSensMatrix> calcAreaSensMatrices, boolean publicMatrices) {
        List<AreaSelectionResponseDto.Matrix> dtos = new ArrayList<>();
        calcAreaSensMatrices.forEach(m -> {
            boolean include =
					!publicMatrices || (publicMatrices && m.getSensitivityMatrix() != null && m.getSensitivityMatrix().getOwner() == null);
            if (include) {
                dtos.add(mapCalcAreaSensMatrixToDto(m));
            }
        });
        return dtos;
    }

    private static AreaSelectionResponseDto.Matrix mapCalcAreaSensMatrixToDto(CalcAreaSensMatrix calcAreaSensMatrix) {
        AreaSelectionResponseDto.Matrix dto = new AreaSelectionResponseDto.Matrix();
        dto.setId(calcAreaSensMatrix.getSensitivityMatrix().getId());
        dto.setName(calcAreaSensMatrix.getSensitivityMatrix().getName());
        return dto;
    }

    private static AreaSelectionResponseDto.Matrix mapSensitivityMatrixToDto(SensitivityMatrix sensitivityMatrix) {
        AreaSelectionResponseDto.Matrix dto = new AreaSelectionResponseDto.Matrix();
        ;
        if (sensitivityMatrix != null) {
            dto.setId(sensitivityMatrix.getId());
            dto.setName(sensitivityMatrix.getName());
        }
        return dto;
    }
}
