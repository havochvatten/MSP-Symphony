package se.havochvatten.symphony.mapper;

import org.junit.Before;
import org.junit.Test;
import se.havochvatten.symphony.dto.SensMatrixDto;
import se.havochvatten.symphony.dto.SensitivityDto;
import se.havochvatten.symphony.entity.Metadata;
import se.havochvatten.symphony.entity.Sensitivity;
import se.havochvatten.symphony.entity.SensitivityMatrix;
import se.havochvatten.symphony.util.SymphonyDtoUtil;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;

public class EntityToSensMatrixDtoMapperTest {
    SensitivityMatrix sensMatrix;
    private final String MATRIX_NAME = "Test Matrix";
    private final int MATRIX_ID = 123;

    @Before
    public void setUp() throws IOException {

        sensMatrix = new SensitivityMatrix();
        sensMatrix.setId(MATRIX_ID);
        sensMatrix.setName(MATRIX_NAME);
        sensMatrix.setSensitivityList(new ArrayList<>());

        Sensitivity sensitivity11 = new Sensitivity();
        Metadata presMetadata1 = new Metadata();
        presMetadata1.setId(576);
        presMetadata1.setTitle("Explosion peak");
        presMetadata1.setTitleLocal("Explosionermaximaltryck(peakmaximumpressure)");
        Metadata ecoMetadata1 = new Metadata();
        ecoMetadata1.setId(626);
        ecoMetadata1.setTitle("Porpoise Belt Sea");
        ecoMetadata1.setTitleLocal("TumlareBälthavet");
        sensitivity11.setPresMetadata(presMetadata1);
        sensitivity11.setEcoMetadata(ecoMetadata1);
        sensitivity11.setValue(BigDecimal.valueOf(0.1));
        sensMatrix.getSensitivityList().add(sensitivity11);

        Sensitivity sensitivity12 = new Sensitivity();
        Metadata ecoMetadata2 = new Metadata();
        ecoMetadata2.setId(627);
        ecoMetadata2.setTitle("Porpoise North Sea");
        ecoMetadata2.setTitleLocal("TumlareNordsjön");
        sensitivity12.setPresMetadata(presMetadata1);
        sensitivity12.setEcoMetadata(ecoMetadata2);
        sensitivity12.setValue(BigDecimal.valueOf(0.2));
        sensMatrix.getSensitivityList().add(sensitivity12);

        Sensitivity sensitivity21 = new Sensitivity();
        Metadata presMetadata2 = new Metadata();
        presMetadata2.setId(577);
        presMetadata2.setTitle("Explosion Sound Exposure Level (SEL)");
        presMetadata2.setTitleLocal("Explosionerljudnivå(SoundExposureLevel)");
        sensitivity21.setPresMetadata(presMetadata2);
        sensitivity21.setEcoMetadata(ecoMetadata1);
        sensitivity21.setValue(BigDecimal.valueOf(0.3));
        sensMatrix.getSensitivityList().add(sensitivity21);

        Sensitivity sensitivity22 = new Sensitivity();
        sensitivity22.setPresMetadata(presMetadata2);
        sensitivity22.setEcoMetadata(ecoMetadata2);
        sensitivity22.setValue(BigDecimal.valueOf(0.4));
        sensMatrix.getSensitivityList().add(sensitivity22);

    }

    @Test
    public void testMap() throws IOException {
        SensMatrixDto sensMatrixDto = SymphonyDtoUtil.createSensMatrixDto(MATRIX_NAME);
        SensMatrixDto mappedDto = EntityToSensMatrixDtoMapper.map(sensMatrix);
        assertThat(mappedDto.getId(), is(sensMatrixDto.getId()));
        assertThat(mappedDto.getName(), is(sensMatrixDto.getName()));
        assertThat(mappedDto.getSensMatrix().getRows().size(), is(2));

        SensitivityDto.SensRow mappedRow1 = mappedDto.getSensMatrix().getRows().get(0);
        SensitivityDto.SensRow row1 = sensMatrixDto.getSensMatrix().getRows().get(0);
        assertThat(mappedRow1.getColumns().size(), is(2));
        SensitivityDto.SensCol mappedCol11 = mappedRow1.getColumns().get(0);
        SensitivityDto.SensCol col11 = row1.getColumns().get(0);
        assertThat(mappedCol11.getEcoMetaId(), is(col11.getEcoMetaId()));
        assertThat(mappedCol11.getName(), is(col11.getName()));
        assertThat(mappedCol11.getValue(), is(col11.getValue()));
        SensitivityDto.SensCol mappedCol12 = mappedRow1.getColumns().get(1);
        SensitivityDto.SensCol col12 = row1.getColumns().get(1);
        assertThat(mappedCol12.getEcoMetaId(), is(col12.getEcoMetaId()));
        assertThat(mappedCol12.getName(), is(col12.getName()));
        assertThat(mappedCol12.getValue(), is(col12.getValue()));

        SensitivityDto.SensRow mappedRow2 = mappedDto.getSensMatrix().getRows().get(1);
        SensitivityDto.SensRow row2 = sensMatrixDto.getSensMatrix().getRows().get(1);
        assertThat(mappedRow2.getColumns().size(), is(2));
        SensitivityDto.SensCol mappedCol21 = mappedRow2.getColumns().get(0);
        SensitivityDto.SensCol col21 = row2.getColumns().get(0);
        assertThat(mappedCol21.getEcoMetaId(), is(col21.getEcoMetaId()));
        assertThat(mappedCol21.getName(), is(col21.getName()));
        assertThat(mappedCol21.getValue(), is(col21.getValue()));
        SensitivityDto.SensCol mappedCol22 = mappedRow1.getColumns().get(1);
        SensitivityDto.SensCol col22 = row1.getColumns().get(1);
        assertThat(mappedCol22.getEcoMetaId(), is(col22.getEcoMetaId()));
        assertThat(mappedCol22.getName(), is(col22.getName()));
        assertThat(mappedCol22.getValue(), is(col22.getValue()));
    }

}
