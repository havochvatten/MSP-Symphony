package se.havochvatten.symphony.mapper;

import org.junit.Before;
import org.junit.Test;
import se.havochvatten.symphony.dto.BaselineVersionDto;
import se.havochvatten.symphony.entity.BaselineVersion;

import java.util.Date;

import static org.junit.Assert.assertEquals;

public class BaselineVersionDtoMapperTest {
    BaselineVersion baselineVersion;

    @Before
    public void init() {
        baselineVersion = new BaselineVersion();
        baselineVersion.setId(1);
        baselineVersion.setName("test");
        baselineVersion.setDescription("test desc");
        baselineVersion.setValidFrom(new Date());
    }

    @Test
    public void mapToDto() {
        BaselineVersionDto dto = BaselineVersionDtoMapper.mapEntityToDto(baselineVersion);
        assertEquals(dto.getId(), baselineVersion.getId());
        assertEquals(dto.getName(), baselineVersion.getName());
        assertEquals(dto.getDescription(), baselineVersion.getDescription());
        assertEquals(dto.getValidFrom(), baselineVersion.getValidFrom());
    }

}
