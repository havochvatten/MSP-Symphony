package se.havochvatten.symphony.mapper;

import se.havochvatten.symphony.dto.BaselineVersionDto;
import se.havochvatten.symphony.entity.BaselineVersion;

import java.util.ArrayList;
import java.util.List;

public class BaselineVersionDtoMapper {

    public static BaselineVersionDto mapEntityToDto(BaselineVersion baselineVersion) {
        BaselineVersionDto dto = new BaselineVersionDto();
        dto.setId(baselineVersion.getId());
        dto.setName(baselineVersion.getName());
        dto.setDescription(baselineVersion.getDescription());
        dto.setLocale(baselineVersion.getLocale());
        dto.setValidFrom(baselineVersion.getValidFrom());
        return dto;
    }

    public static List<BaselineVersionDto> mapEntitiesToDtos(List<BaselineVersion> baselineVersions) {
        List<BaselineVersionDto> dtos = new ArrayList<>();
        baselineVersions.forEach(b -> {
            dtos.add(mapEntityToDto(b));
        });
        return dtos;
    }
}
