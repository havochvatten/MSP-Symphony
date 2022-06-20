package se.havochvatten.symphony.mapper;

import org.junit.Before;
import org.junit.Test;
import se.havochvatten.symphony.dto.SensMatrixDto;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.entity.Metadata;
import se.havochvatten.symphony.entity.Sensitivity;
import se.havochvatten.symphony.entity.SensitivityMatrix;
import se.havochvatten.symphony.util.SymphonyDtoUtil;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;

public class SensMatrixDtoToEntityMapperTest {
    private final String MATRIX_NAME = "Test Matrix";
    List<Sensitivity> sensitivities;

    @Before
    public void setUp() {
        sensitivities = new ArrayList<>();

        Sensitivity sensitivity11 = new Sensitivity();
        sensitivity11.setId(11);
        Metadata presMetadata1 = new Metadata();
        presMetadata1.setId(576);
        presMetadata1.setTitleLocal("Explosionermaximaltryck(peakmaximumpressure)");
        presMetadata1.setBandNumber(1);
        Metadata ecoMetadata1 = new Metadata();
        ecoMetadata1.setId(626);
        ecoMetadata1.setTitleLocal("TumlareBälthavet");
        ecoMetadata1.setBandNumber(2);
        sensitivity11.setPresMetadata(presMetadata1);
        sensitivity11.setEcoMetadata(ecoMetadata1);
        sensitivity11.setValue(BigDecimal.valueOf(0.1));
        sensitivities.add(sensitivity11);

        Sensitivity sensitivity12 = new Sensitivity();
        sensitivity12.setId(12);
        Metadata ecoMetadata2 = new Metadata();
        ecoMetadata2.setId(627);
        ecoMetadata2.setTitleLocal("TumlareNordsjön");
        ecoMetadata2.setBandNumber(3);
        sensitivity12.setPresMetadata(presMetadata1);
        sensitivity12.setEcoMetadata(ecoMetadata2);
        sensitivity12.setValue(BigDecimal.valueOf(0.2));
        sensitivities.add(sensitivity12);

        Sensitivity sensitivity21 = new Sensitivity();
        sensitivity21.setId(21);
        Metadata presMetadata2 = new Metadata();
        presMetadata2.setId(577);
        presMetadata2.setTitleLocal("Explosionerljudnivå(SoundExposureLevel)");
        presMetadata2.setBandNumber(4);
        sensitivity21.setPresMetadata(presMetadata2);
        sensitivity21.setEcoMetadata(ecoMetadata1);
        sensitivity21.setValue(BigDecimal.valueOf(0.3));
        sensitivities.add(sensitivity21);

        Sensitivity sensitivity22 = new Sensitivity();
        sensitivity22.setId(2);
        sensitivity22.setPresMetadata(presMetadata2);
        sensitivity22.setEcoMetadata(ecoMetadata2);
        sensitivity22.setValue(BigDecimal.valueOf(0.4));
        sensitivities.add(sensitivity22);
    }

    @Test
    public void testMapper() throws IOException {
        SensMatrixDto sensMatrixDto = SymphonyDtoUtil.createSensMatrixDto(MATRIX_NAME);
        BaselineVersion baselineVersion = new BaselineVersion();
        baselineVersion.setId(1);
        SensitivityMatrix mappedSensitivityMatrix = SensMatrixDtoToEntityMapper.mapToEntity(sensMatrixDto,
				sensitivities, baselineVersion);
        assertThat(mappedSensitivityMatrix.getBaselineVersion().getId(), is(1));
        assertThat(mappedSensitivityMatrix.getName(), is(MATRIX_NAME));
        assertThat(mappedSensitivityMatrix.getSensitivityList().size(), is(4));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(0).getId(),
				is(sensitivities.get(0).getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(0).getValue(),
				is(sensitivities.get(0).getValue()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(0).getPresMetadata().getId(),
				is(sensitivities.get(0).getPresMetadata().getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(0).getPresMetadata().getTitleLocal(),
				is(sensitivities.get(0).getPresMetadata().getTitleLocal()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(0).getPresMetadata().getBandNumber(),
				is(sensitivities.get(0).getPresMetadata().getBandNumber()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(0).getEcoMetadata().getId(),
				is(sensitivities.get(0).getEcoMetadata().getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(0).getEcoMetadata().getTitleLocal(),
				is(sensitivities.get(0).getEcoMetadata().getTitleLocal()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(0).getEcoMetadata().getBandNumber(),
				is(sensitivities.get(0).getEcoMetadata().getBandNumber()));

        assertThat(mappedSensitivityMatrix.getSensitivityList().get(1).getId(),
				is(sensitivities.get(1).getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(1).getValue(),
				is(sensitivities.get(1).getValue()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(1).getPresMetadata().getId(),
				is(sensitivities.get(1).getPresMetadata().getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(1).getPresMetadata().getTitleLocal(),
				is(sensitivities.get(1).getPresMetadata().getTitleLocal()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(1).getPresMetadata().getBandNumber(),
				is(sensitivities.get(1).getPresMetadata().getBandNumber()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(1).getEcoMetadata().getId(),
				is(sensitivities.get(1).getEcoMetadata().getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(1).getEcoMetadata().getTitleLocal(),
				is(sensitivities.get(1).getEcoMetadata().getTitleLocal()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(1).getEcoMetadata().getBandNumber(),
				is(sensitivities.get(1).getEcoMetadata().getBandNumber()));


        assertThat(mappedSensitivityMatrix.getSensitivityList().get(2).getId(),
				is(sensitivities.get(2).getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(2).getValue(),
				is(sensitivities.get(2).getValue()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(2).getPresMetadata().getId(),
				is(sensitivities.get(2).getPresMetadata().getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(2).getPresMetadata().getTitleLocal(),
				is(sensitivities.get(2).getPresMetadata().getTitleLocal()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(2).getPresMetadata().getBandNumber(),
				is(sensitivities.get(2).getPresMetadata().getBandNumber()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(2).getEcoMetadata().getId(),
				is(sensitivities.get(2).getEcoMetadata().getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(2).getEcoMetadata().getTitleLocal(),
				is(sensitivities.get(2).getEcoMetadata().getTitleLocal()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(2).getEcoMetadata().getBandNumber(),
				is(sensitivities.get(2).getEcoMetadata().getBandNumber()));

        assertThat(mappedSensitivityMatrix.getSensitivityList().get(3).getId(),
				is(sensitivities.get(3).getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(3).getValue(),
				is(sensitivities.get(3).getValue()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(3).getPresMetadata().getId(),
				is(sensitivities.get(3).getPresMetadata().getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(3).getPresMetadata().getTitleLocal(),
				is(sensitivities.get(3).getPresMetadata().getTitleLocal()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(3).getPresMetadata().getBandNumber(),
				is(sensitivities.get(3).getPresMetadata().getBandNumber()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(3).getEcoMetadata().getId(), is(sensitivities.get(3).getEcoMetadata().getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(3).getEcoMetadata().getTitleLocal(), is(sensitivities.get(3).getEcoMetadata().getTitleLocal()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(3).getEcoMetadata().getBandNumber(), is(sensitivities.get(3).getEcoMetadata().getBandNumber()));
    }

}
