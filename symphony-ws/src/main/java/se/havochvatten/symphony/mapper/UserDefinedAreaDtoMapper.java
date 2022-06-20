package se.havochvatten.symphony.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import se.havochvatten.symphony.dto.UserDefinedAreaDto;
import se.havochvatten.symphony.entity.UserDefinedArea;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class UserDefinedAreaDtoMapper {

    public static UserDefinedArea mapToEntity(UserDefinedAreaDto dto, String owner) throws SymphonyStandardAppException {
        UserDefinedArea userDefinedArea = new UserDefinedArea();
        userDefinedArea.setId(dto.getId());
        userDefinedArea.setName(dto.getName());
        userDefinedArea.setDescription(dto.getDescription());
        userDefinedArea.setOwner(owner);
        ObjectMapper obj = new ObjectMapper();
        String jsonStr = "";
        try {
            jsonStr = obj.writeValueAsString(dto.getPolygon());
        } catch (IOException e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.USER_DEF_AREA_POLYGON_MAPPING_ERROR);
        }
        userDefinedArea.setPolygon(jsonStr);
        return userDefinedArea;
    }

    public static UserDefinedAreaDto mapToDto(UserDefinedArea entity) throws SymphonyStandardAppException {
        UserDefinedAreaDto dto = new UserDefinedAreaDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        ObjectMapper ob = new ObjectMapper();

        try {
            TypeReference ref = new TypeReference<Object>() {};
            Object o = ob.readValue(entity.getPolygon(), ref);
            dto.setPolygon(o);
        } catch (IOException e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.USER_DEF_AREA_POLYGON_MAPPING_ERROR);
        }
        return dto;
    }

    public static List<UserDefinedAreaDto> mapToDtos(List<UserDefinedArea> entities) throws SymphonyStandardAppException {
        List<UserDefinedAreaDto> userDefinedAreaDtos = new ArrayList<>();
        if (entities == null) {
            return userDefinedAreaDtos;
        }
        for (UserDefinedArea userDefinedArea : entities) {
            userDefinedAreaDtos.add(mapToDto(userDefinedArea));
        }
        return userDefinedAreaDtos;
    }

}
