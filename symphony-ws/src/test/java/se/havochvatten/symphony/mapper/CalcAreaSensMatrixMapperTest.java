package se.havochvatten.symphony.mapper;

import org.junit.Before;
import org.junit.Test;
import se.havochvatten.symphony.dto.CalcAreaSensMatrixDto;
import se.havochvatten.symphony.entity.CalcAreaSensMatrix;
import se.havochvatten.symphony.entity.CalculationArea;
import se.havochvatten.symphony.entity.SensitivityMatrix;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;

public class CalcAreaSensMatrixMapperTest {
    private CalcAreaSensMatrix calcAreaSensMatrix;
    private CalcAreaSensMatrixDto calcAreaSensMatrixDto;
    private CalculationArea calculationArea;
    private SensitivityMatrix sensitivityMatrix;

    @Before
    public void setUpp() {
        calcAreaSensMatrixDto = new CalcAreaSensMatrixDto();
        calcAreaSensMatrixDto.setId(1);
        calcAreaSensMatrixDto.setComment("Comment123");
        calcAreaSensMatrixDto.setCalcareaId(2);
        calcAreaSensMatrixDto.setSensmatrixId(3);

        calcAreaSensMatrix = new CalcAreaSensMatrix();
        calculationArea = new CalculationArea();
        sensitivityMatrix = new SensitivityMatrix();
        calculationArea.setId(2);
        sensitivityMatrix.setId(3);
        calcAreaSensMatrix.setId(1);
        calcAreaSensMatrix.setComment("Comment123");
        calcAreaSensMatrix.setCalculationArea(calculationArea);
        calcAreaSensMatrix.setCalculationArea(calculationArea);
        calcAreaSensMatrix.setSensitivityMatrix(sensitivityMatrix);
    }

    @Test
    public void testMapToEntity() {
        CalcAreaSensMatrix entity = CalcAreaSensMatrixMapper.mapToEntity(calcAreaSensMatrixDto,
				calculationArea, sensitivityMatrix);
        assertThat(entity.getId(), is(calcAreaSensMatrix.getId()));
        assertThat(entity.getComment(), is(calcAreaSensMatrix.getComment()));
        assertThat(entity.getCalculationArea().getId(), is(calcAreaSensMatrix.getCalculationArea().getId()));
        assertThat(entity.getSensitivityMatrix().getId(),
				is(calcAreaSensMatrix.getSensitivityMatrix().getId()));
    }

    @Test
    public void testMapToDto() {
        CalcAreaSensMatrixDto dto = CalcAreaSensMatrixMapper.mapToDto(calcAreaSensMatrix);
        assertThat(dto.getId(), is(calcAreaSensMatrixDto.getId()));
        assertThat(dto.getComment(), is(calcAreaSensMatrixDto.getComment()));
        assertThat(dto.getCalcareaId(), is(calcAreaSensMatrixDto.getCalcareaId()));
        assertThat(dto.getSensmatrixId(), is(calcAreaSensMatrixDto.getSensmatrixId()));
    }

}
