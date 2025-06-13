package se.havochvatten.symphony.mapper;

import se.havochvatten.symphony.dto.SensMatrixDto;
import se.havochvatten.symphony.dto.SensitivityDto;
import se.havochvatten.symphony.entity.Sensitivity;
import se.havochvatten.symphony.entity.SensitivityMatrix;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class EntityToSensMatrixDtoMapper {

    public static SensMatrixDto map(SensitivityMatrix sensMatrix, String preferredLanguage) {
        SensMatrixDto dto = new SensMatrixDto();
        dto.setId(sensMatrix.getId());
        dto.setName(sensMatrix.getName());
        dto.setOwner(sensMatrix.getOwner());
        Comparator<Sensitivity> compE = Comparator.comparing(s -> s.getEcoBand().getBandNumber());
        List<Sensitivity> sortedSensitivities =
            sensMatrix.getSensitivityList().stream().sorted(compE).toList();

        dto.setSensMatrix(mapToMatrixDto(sortedSensitivities, preferredLanguage));

        return dto;
    }

    private static SensitivityDto mapToMatrixDto(List<Sensitivity> sensitivities, String preferredLanguage) {
        Map<Integer, SensitivityDto.SensRow> rowMap = new HashMap<>();
        Map<Integer, Integer> rowOrderMap = new HashMap<>();

        if(preferredLanguage == null) {
            preferredLanguage = sensitivities.stream().findFirst()
                                    .map(s -> s.getEcoBand().getBaseline().getLocale())
                                    .orElseThrow(Error::new);
        }
        preferredLanguage = preferredLanguage == null ? "en" : preferredLanguage;

        for (Sensitivity sens : sensitivities) {
            SensitivityDto.SensCol scolumn = new SensitivityDto.SensCol();

            scolumn.setSensId(Optional.ofNullable(sens.getId()).orElse(-1));
            scolumn.setEcoMetaId(sens.getEcoBand().getId());
            scolumn.setName(sens.getEcoBand().getTitle(preferredLanguage));
            scolumn.setValue(sens.getValue());

            Integer rid = sens.getPressureBand().getId();
            if (!rowMap.containsKey(rid)) {
                SensitivityDto.SensRow srow = new SensitivityDto.SensRow();
                srow.setPresMetaId(rid);
                srow.setName(sens.getPressureBand().getTitle(preferredLanguage));
                srow.getColumns().add(scolumn);
                rowMap.put(rid, srow);
                rowOrderMap.put(rid, sens.getPressureBand().getBandNumber());
            } else {
                SensitivityDto.SensRow srow = rowMap.get(rid);
                srow.getColumns().add(scolumn);
            }
        }

        SensitivityDto sensDto = new SensitivityDto();

        rowMap.values().stream().sorted(
            Comparator.comparingInt(r -> rowOrderMap.get(r.getPresMetaId()))
        ).forEach(s ->  sensDto.getRows().add(s));

        return sensDto;
    }

    // prevent instantiation
    private EntityToSensMatrixDtoMapper() {}
}
