package se.havochvatten.symphony.mapper;

import org.junit.Before;
import org.junit.Test;

import se.havochvatten.symphony.dto.SensMatrixDto;
import se.havochvatten.symphony.entity.*;
import se.havochvatten.symphony.util.SymphonyDtoUtil;

import java.io.IOException;
import java.util.List;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;

public class SensMatrixDtoToEntityMapperTest {

    private final String MATRIX_NAME = "Test Matrix";
    List<Sensitivity> sensitivities;

    @Before
    public void setUp() {
        sensitivities = SymphonyDtoUtil.commonSensitivities();
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
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(0).getPressureBand().getId(),
            is(sensitivities.get(0).getPressureBand().getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(0).getPressureBand().getTitle("sv"),
            is(sensitivities.get(0).getPressureBand().getTitle("sv")));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(0).getPressureBand().getBandNumber(),
            is(sensitivities.get(0).getPressureBand().getBandNumber()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(0).getEcoBand().getId(),
            is(sensitivities.get(0).getEcoBand().getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(0).getEcoBand().getTitle("sv"),
            is(sensitivities.get(0).getEcoBand().getTitle("sv")));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(0).getEcoBand().getBandNumber(),
            is(sensitivities.get(0).getEcoBand().getBandNumber()));

        assertThat(mappedSensitivityMatrix.getSensitivityList().get(1).getId(),
            is(sensitivities.get(1).getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(1).getValue(),
            is(sensitivities.get(1).getValue()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(1).getPressureBand().getId(),
            is(sensitivities.get(1).getPressureBand().getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(1).getPressureBand().getTitle("sv"),
            is(sensitivities.get(1).getPressureBand().getTitle("sv")));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(1).getPressureBand().getBandNumber(),
            is(sensitivities.get(1).getPressureBand().getBandNumber()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(1).getEcoBand().getId(),
            is(sensitivities.get(1).getEcoBand().getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(1).getEcoBand().getTitle("sv"),
            is(sensitivities.get(1).getEcoBand().getTitle("sv")));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(1).getEcoBand().getBandNumber(),
            is(sensitivities.get(1).getEcoBand().getBandNumber()));


        assertThat(mappedSensitivityMatrix.getSensitivityList().get(2).getId(),
            is(sensitivities.get(2).getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(2).getValue(),
            is(sensitivities.get(2).getValue()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(2).getPressureBand().getId(),
            is(sensitivities.get(2).getPressureBand().getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(2).getPressureBand().getTitle("sv"),
            is(sensitivities.get(2).getPressureBand().getTitle("sv")));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(2).getPressureBand().getBandNumber(),
            is(sensitivities.get(2).getPressureBand().getBandNumber()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(2).getEcoBand().getId(),
            is(sensitivities.get(2).getEcoBand().getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(2).getEcoBand().getTitle("sv"),
            is(sensitivities.get(2).getEcoBand().getTitle("sv")));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(2).getEcoBand().getBandNumber(),
            is(sensitivities.get(2).getEcoBand().getBandNumber()));

        assertThat(mappedSensitivityMatrix.getSensitivityList().get(3).getId(),
            is(sensitivities.get(3).getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(3).getValue(),
            is(sensitivities.get(3).getValue()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(3).getPressureBand().getId(),
            is(sensitivities.get(3).getPressureBand().getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(3).getPressureBand().getTitle("sv"),
            is(sensitivities.get(3).getPressureBand().getTitle("sv")));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(3).getPressureBand().getBandNumber(),
            is(sensitivities.get(3).getPressureBand().getBandNumber()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(3).getEcoBand().getId(), is(sensitivities.get(3).getEcoBand().getId()));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(3).getEcoBand().getTitle("sv"), is(sensitivities.get(3).getEcoBand().getTitle("sv")));
        assertThat(mappedSensitivityMatrix.getSensitivityList().get(3).getEcoBand().getBandNumber(), is(sensitivities.get(3).getEcoBand().getBandNumber()));

    }

}
