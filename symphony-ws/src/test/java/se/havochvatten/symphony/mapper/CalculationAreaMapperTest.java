package se.havochvatten.symphony.mapper;

import org.junit.Before;
import org.junit.Test;
import se.havochvatten.symphony.dto.CaPolygonDto;
import se.havochvatten.symphony.dto.CalculationAreaDto;
import se.havochvatten.symphony.entity.CaPolygon;
import se.havochvatten.symphony.entity.CalculationArea;
import se.havochvatten.symphony.entity.SensitivityMatrix;

import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;

public class CalculationAreaMapperTest {
    CalculationArea calculationArea;
    CalculationAreaDto calculationAreaDto;
    SensitivityMatrix defaultSensitivityMatrix;

    @Before
    public void setUp() {
        calculationArea = new CalculationArea();
        defaultSensitivityMatrix = new SensitivityMatrix();
        defaultSensitivityMatrix.setId(2);
        List<CaPolygon> caPolygons = new ArrayList<>();
        CaPolygon caPolygon1 = new CaPolygon();
        caPolygon1.setId(3);
        caPolygon1.setPolygon("[[1,2],[3,4]]");
        caPolygons.add(caPolygon1);
        CaPolygon caPolygon2 = new CaPolygon();
        caPolygon2.setId(4);
        caPolygon2.setPolygon("[[5,6],[7,8]]");
        caPolygons.add(caPolygon2);
        calculationArea.setId(1);
        calculationArea.setName("NameABC");
        calculationArea.setCareaDefault(true);
        calculationArea.setdefaultSensitivityMatrix(defaultSensitivityMatrix);
        calculationArea.setCaPolygonList(caPolygons);

        calculationAreaDto = new CalculationAreaDto();
        calculationAreaDto.setId(1);
        calculationAreaDto.setName("NameABC");
        calculationAreaDto.setCareaDefault(true);
        calculationAreaDto.setDefaultSensitivityMatrixId(2);
        List<CaPolygonDto> polygonDtos = new ArrayList<>();
        CaPolygonDto polygonDto1 = new CaPolygonDto();
        polygonDto1.setId(3);
        polygonDto1.setPolygon("[[1,2],[3,4]]");
        polygonDtos.add(polygonDto1);
        CaPolygonDto polygonDto2 = new CaPolygonDto();
        polygonDto2.setId(4);
        polygonDto2.setPolygon("[[5,6],[7,8]]");
        polygonDtos.add(polygonDto2);
        calculationAreaDto.getPolygons().addAll(polygonDtos);
    }

    @Test
    public void mapToEntity() {
        CalculationArea entity = CalculationAreaMapper.mapToEntity(calculationAreaDto,
				defaultSensitivityMatrix);
        assertThat(entity.getId(), is(calculationArea.getId()));
        assertThat(entity.getName(), is(calculationArea.getName()));
        assertThat(entity.isCareaDefault(), is(calculationArea.isCareaDefault()));
        assertThat(entity.getCaPolygonList().size(), is(calculationArea.getCaPolygonList().size()));
        assertThat(entity.getCaPolygonList().get(0).getId(),
				is(calculationArea.getCaPolygonList().get(0).getId()));
        assertThat(entity.getCaPolygonList().get(0).getPolygon(),
				is(calculationArea.getCaPolygonList().get(0).getPolygon()));
        assertThat(entity.getDefaultSensitivityMatrix().getId(),
				is(calculationArea.getDefaultSensitivityMatrix().getId()));
    }

    @Test
    public void mapToDto() {
        CalculationAreaDto dto = CalculationAreaMapper.mapToDto(calculationArea);
        assertThat(dto.getId(), is(calculationAreaDto.getId()));
        assertThat(dto.getName(), is(calculationAreaDto.getName()));
        assertThat(dto.isCareaDefault(), is(calculationAreaDto.isCareaDefault()));
        assertThat(dto.getPolygons().size(), is(calculationAreaDto.getPolygons().size()));
        assertThat(dto.getPolygons().get(1).getId(), is(calculationAreaDto.getPolygons().get(1).getId()));
        assertThat(dto.getPolygons().get(1).getPolygon(), is(calculationAreaDto.getPolygons().get(1).getPolygon()));
        assertThat(dto.getDefaultSensitivityMatrixId(), is(calculationAreaDto.getDefaultSensitivityMatrixId()));
    }

}
