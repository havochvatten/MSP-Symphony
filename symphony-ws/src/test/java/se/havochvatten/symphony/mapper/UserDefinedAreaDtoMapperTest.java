package se.havochvatten.symphony.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Before;
import org.junit.Test;
import se.havochvatten.symphony.dto.UserDefinedAreaDto;
import se.havochvatten.symphony.entity.UserDefinedArea;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;

import java.io.IOException;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;

public class UserDefinedAreaDtoMapperTest {
    UserDefinedAreaDto userDefinedAreaDto;
    UserDefinedArea userDefinedArea;
    String principalUserName = "symphony";

    @Before
    public void setUp() throws IOException {
        userDefinedAreaDto = new UserDefinedAreaDto();
        userDefinedAreaDto.setId(1);
        userDefinedAreaDto.setName("UDA1");
        userDefinedAreaDto.setDescription("UDA1 Desc");
        userDefinedAreaDto.setPolygon(getPolygonObj());

        userDefinedArea = new UserDefinedArea();
        userDefinedArea.setId(1);
        userDefinedArea.setName("UDA1");
        userDefinedArea.setDescription("UDA1 Desc");
        userDefinedArea.setPolygon(getPolygon());
    }

    @Test
    public void testMapToEntity() throws SymphonyStandardAppException {
        UserDefinedArea uda = UserDefinedAreaDtoMapper.mapToEntity(userDefinedAreaDto, principalUserName);
        assertThat(uda.getId(), is(userDefinedArea.getId()));
        assertThat(uda.getName(), is(userDefinedArea.getName()));
        assertThat(uda.getDescription(), is(userDefinedArea.getDescription()));
        assertThat(uda.getPolygon(), is(getPolygon()));
        assertThat(uda.getOwner(), is(principalUserName));
    }

    @Test
    public void testMapToDto() throws SymphonyStandardAppException, IOException {
        UserDefinedAreaDto dto = UserDefinedAreaDtoMapper.mapToDto(userDefinedArea);
        assertThat(dto.getId(), is(userDefinedAreaDto.getId()));
        assertThat(dto.getName(), is(userDefinedAreaDto.getName()));
        assertThat(dto.getDescription(), is(userDefinedAreaDto.getDescription()));
        assertThat(dto.getPolygon(), is(getPolygonObj()));
    }

    private String getPolygon() {
        String polygon = "[{\"type\":\"MultiPolygon\",\"coordinates\":[[[[11.0297928692772,58" +
				".2056796216156],[10.900990771327,58.1543842596864],[10.9113818611597,58.0807539475141],[10" +
				".873578408857,58.0655753975955],[10.8461049630923,58.0984715227401],[10.8459816293868,58" +
				".098619045263],[10.7653517089694,58.1947676452404],[10.7995005088391,58.1829599900567],[10" +
				".8423401181587,58.1871920171231],[10.9744183945745,58.2393434087862],[11.0297928692772,58" +
				".2056796216156]]]]}]";
        return polygon;
    }

    private Object getPolygonObj() throws IOException {
        String polygon = getPolygon();
        ObjectMapper ob = new ObjectMapper();
        TypeReference ref = new TypeReference<Object>() {};
        Object polygonObj = ob.readValue(polygon, ref);
        return polygonObj;
    }

}
