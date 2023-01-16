package se.havochvatten.symphony.mapper;

import se.havochvatten.symphony.dto.SensMatrixDto;
import se.havochvatten.symphony.dto.SensitivityDto;
import se.havochvatten.symphony.entity.Sensitivity;
import se.havochvatten.symphony.entity.SensitivityMatrix;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class EntityToSensMatrixDtoMapper {

    public static SensMatrixDto map(SensitivityMatrix sensMatrix) {
        SensMatrixDto dto = new SensMatrixDto();
        dto.setId(sensMatrix.getId());
        dto.setName(sensMatrix.getName());
        dto.setOwner(sensMatrix.getOwner());
        Comparator<Sensitivity> compP = Comparator.comparing(s -> s.getPresMetadata().getBandNumber());
        Comparator<Sensitivity> compE = Comparator.comparing(s -> s.getEcoMetadata().getBandNumber());
        List<Sensitivity> sortedSensitivities =
            sensMatrix.getSensitivityList().stream().sorted(compP.thenComparing(compE)).collect(Collectors.toList());

        dto.setSensMatrix(mapToMatrixDto(sortedSensitivities));

        return dto;
    }

    private static SensitivityDto mapToMatrixDto(List<Sensitivity> sensitivities) {
        Map<Integer, SensitivityDto.SensRow> rowMap = new HashMap<>();
        for (Sensitivity sens : sensitivities) {
            SensitivityDto.SensCol scolumn = new SensitivityDto.SensCol();

            scolumn.setSensId(sens.getId());
            scolumn.setEcoMetaId(sens.getEcoMetadata().getId());
            scolumn.setName(sens.getEcoMetadata().getTitle());
            scolumn.setNameLocal(sens.getEcoMetadata().getTitleLocal());
            scolumn.setValue(sens.getValue());

            Integer rid = sens.getPresMetadata().getId();
            if (!rowMap.containsKey(rid)) {
                SensitivityDto.SensRow srow = new SensitivityDto.SensRow();
                srow.setPresMetaId(rid);
                srow.setName(sens.getPresMetadata().getTitle());
                srow.setNameLocal(sens.getPresMetadata().getTitleLocal());
                srow.getColumns().add(scolumn);
                rowMap.put(rid, srow);
            } else {
                SensitivityDto.SensRow srow = rowMap.get(rid);
                srow.getColumns().add(scolumn);
            }
        }

        SensitivityDto sensDto = new SensitivityDto();
        rowMap.values().forEach(s -> {
            sensDto.getRows().add(s);
        });
        return sensDto;
    }
}
