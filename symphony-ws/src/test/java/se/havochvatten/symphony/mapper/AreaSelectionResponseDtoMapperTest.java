package se.havochvatten.symphony.mapper;

import org.junit.Before;
import org.junit.Test;
import se.havochvatten.symphony.dto.AreaSelectionResponseDto;
import se.havochvatten.symphony.dto.MatrixSelection;
import se.havochvatten.symphony.entity.AreaType;
import se.havochvatten.symphony.entity.CalcAreaSensMatrix;
import se.havochvatten.symphony.entity.CalculationArea;
import se.havochvatten.symphony.entity.SensitivityMatrix;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;

import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;

public class AreaSelectionResponseDtoMapperTest {
    CalculationArea defaultArea;
    List<AreaType> areaTypes = new ArrayList<>();
    List<CalculationArea> calculationAreasA1 = new ArrayList<>();
    List<CalcAreaSensMatrix> userDefinedCalcAreaSensMatrices = new ArrayList<>();

    @Before
    public void setUp() {
        defaultArea = new CalculationArea();
        defaultArea.setId(1);
        defaultArea.setName("mspArea1");
        defaultArea.setdefaultSensitivityMatrix(createSensitivityMatrix(2, "defAreaDefaultMtrx"));
        defaultArea.setCalcAreaSensMatrixList(new ArrayList<>());
        defaultArea.getCalcAreaSensMatrixList().add(createCalcAreaSensMatrix(3, "defAreaMtrx1"));

        AreaType areaType = new AreaType();
        areaType.setId(1);
        areaType.setAtypeName("atype1");
        areaType.setCoastalArea(true);

        List<CalcAreaSensMatrix> calcAreaSensMatrixList = new ArrayList<>();
        calcAreaSensMatrixList.add(createCalcAreaSensMatrix(5, "Mtrx5"));
        calcAreaSensMatrixList.add(createCalcAreaSensMatrix(6, "Mtrx6"));
        calcAreaSensMatrixList.add(createCalcAreaSensMatrix(7, "Mtrx7"));
        CalculationArea calculationArea = createCalculationArea(10, "calcarea1", createSensitivityMatrix(4,
				"defMatrixCa1"), calcAreaSensMatrixList);
        calculationAreasA1.add(calculationArea);
        calcAreaSensMatrixList = new ArrayList<>();
        calcAreaSensMatrixList.add(createCalcAreaSensMatrix(8, "Mtrx8"));
        CalculationArea calculationArea2 = createCalculationArea(10, "calcare21", createSensitivityMatrix(5
				, "defMatrixCa2"), calcAreaSensMatrixList);
        calculationAreasA1.add(calculationArea2);

        areaType.setCalculationAreas(calculationAreasA1);
        areaTypes.add(areaType);

        userDefinedCalcAreaSensMatrices.add(createCalcAreaSensMatrix(10, "umtrx1"));
        userDefinedCalcAreaSensMatrices.add(createCalcAreaSensMatrix(11, "umtrx2"));
    }

    @Test
    public void testMapToDto() throws SymphonyStandardAppException {
        List<AreaSelectionResponseDto.AreaTypeArea> areaTypeDtos = new ArrayList<>();
        AreaSelectionResponseDto.AreaTypeArea areaTypeDto =
				AreaSelectionResponseDtoMapper.mapToAreaTypeDto(areaTypes.get(0), calculationAreasA1);
        areaTypeDtos.add(areaTypeDto);
        AreaSelectionResponseDto respDto = AreaSelectionResponseDtoMapper.mapToDto(defaultArea,
				areaTypeDtos, userDefinedCalcAreaSensMatrices, new ArrayList<>());
        assertThat(respDto.getDefaultArea().getId(), is(defaultArea.getId()));
        assertThat(respDto.getDefaultArea().getName(), is(defaultArea.getName()));
        assertThat(respDto.getDefaultArea().getDefaultMatrix().getId(),
				is(defaultArea.getDefaultSensitivityMatrix().getId()));
        assertThat(respDto.getDefaultArea().getDefaultMatrix().getName(),
				is(defaultArea.getDefaultSensitivityMatrix().getName()));
        assertThat(respDto.getDefaultArea().getMatrices().size(),
				is(defaultArea.getCalcAreaSensMatrixList().size()));
        assertThat(respDto.getDefaultArea().getMatrices().get(0).getId(),
				is(defaultArea.getCalcAreaSensMatrixList().get(0).getSensitivityMatrix().getId()));
        assertThat(respDto.getDefaultArea().getMatrices().get(0).getName(),
				is(defaultArea.getCalcAreaSensMatrixList().get(0).getSensitivityMatrix().getName()));
        assertThat(respDto.getDefaultArea().getUserDefinedMatrices().size(), is(2));
        assertThat(respDto.getDefaultArea().getUserDefinedMatrices().get(0).getId(),
				is(userDefinedCalcAreaSensMatrices.get(0).getSensitivityMatrix().getId()));
        assertThat(respDto.getDefaultArea().getUserDefinedMatrices().get(0).getName(),
				is(userDefinedCalcAreaSensMatrices.get(0).getSensitivityMatrix().getName()));

        assertThat(respDto.getAreaTypes().size(), is(areaTypes.size()));
        AreaType areaType = areaTypes.get(0);
        AreaSelectionResponseDto.AreaTypeArea areaTypeAreaDto = respDto.getAreaTypes().get(0);
        assertThat(areaTypeAreaDto.getId(), is(areaType.getId()));
        assertThat(areaTypeAreaDto.getName(), is(areaType.getAtypeName()));
        assertThat(areaTypeAreaDto.isCoastalArea(), is(areaType.isCoastalArea()));
        assertThat(areaTypeAreaDto.getAreas().size(), is(areaType.getCalculationAreas().size()));

        AreaSelectionResponseDto.Area areaDto = areaTypeAreaDto.getAreas().get(0);
        CalculationArea carea = areaType.getCalculationAreas().get(0);
        assertThat(areaDto.getId(), is(carea.getId()));
        assertThat(areaDto.getName(), is(carea.getName()));
        assertThat(areaDto.getDefaultMatrix().getId(), is(carea.getDefaultSensitivityMatrix().getId()));
        assertThat(areaDto.getDefaultMatrix().getName(), is(carea.getDefaultSensitivityMatrix().getName()));

        assertThat(areaDto.getMatrices().size(), is(carea.getCalcAreaSensMatrixList().size()));
        MatrixSelection areaMatrixDto = areaDto.getMatrices().get(0);
        SensitivityMatrix calcAreaMatrix = carea.getCalcAreaSensMatrixList().get(0).getSensitivityMatrix();
        assertThat(areaMatrixDto.getId(), is(calcAreaMatrix.getId()));
        assertThat(areaMatrixDto.getName(), is(calcAreaMatrix.getName()));
    }

    private CalculationArea createCalculationArea(Integer calcAreaId, String calcAreaName,
												  SensitivityMatrix defaultMatrix,
                                                  List<CalcAreaSensMatrix> calcAreaSensMatrixList) {
        CalculationArea calculationArea = new CalculationArea();
        calculationArea.setId(calcAreaId);
        calculationArea.setName(calcAreaName);
        calculationArea.setdefaultSensitivityMatrix(defaultMatrix);
        calculationArea.setCalcAreaSensMatrixList(calcAreaSensMatrixList);
        return calculationArea;
    }

    private CalcAreaSensMatrix createCalcAreaSensMatrix(Integer sensmatrixId, String sensmatrixname) {
        CalcAreaSensMatrix calcAreaSensMatrix = new CalcAreaSensMatrix();
        SensitivityMatrix sensitivityMatrix = createSensitivityMatrix(sensmatrixId, sensmatrixname);
        calcAreaSensMatrix.setSensitivityMatrix(sensitivityMatrix);
        return calcAreaSensMatrix;
    }

    private SensitivityMatrix createSensitivityMatrix(Integer id, String name) {
        SensitivityMatrix matrix = new SensitivityMatrix();
        matrix.setId(id);
        matrix.setName(name);
        return matrix;
    }
}
