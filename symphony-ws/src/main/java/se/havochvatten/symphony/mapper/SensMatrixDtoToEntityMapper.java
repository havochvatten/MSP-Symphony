package se.havochvatten.symphony.mapper;

import se.havochvatten.symphony.dto.SensMatrixDto;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.entity.Sensitivity;
import se.havochvatten.symphony.entity.SensitivityMatrix;

import java.util.List;

public class SensMatrixDtoToEntityMapper {

    public static SensitivityMatrix mapToEntity(SensMatrixDto sensMatrixDto,
												List<Sensitivity> sensitivities,
												BaselineVersion baselineVersion) {
        SensitivityMatrix sensitivityMatrix = new SensitivityMatrix();
        sensitivityMatrix.setId(sensMatrixDto.getId());
        sensitivityMatrix.setName(sensMatrixDto.getName());
        sensitivityMatrix.setBaselineVersion(baselineVersion);
        sensitivities.forEach(s -> {
            s.setMatrix(sensitivityMatrix);
        });
        sensitivityMatrix.setSensitivityList(sensitivities);

        return sensitivityMatrix;
    }
}
