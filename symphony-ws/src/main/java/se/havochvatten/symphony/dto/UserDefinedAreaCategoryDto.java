package se.havochvatten.symphony.dto;
import java.util.List;

public class UserDefinedAreaCategoryDto {
    private Integer id;
    private String name;
    private List<UserDefinedAreaDto> areas;
    
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<UserDefinedAreaDto> getAreas(){
        return areas;
    }

    public void setAreas(List<UserDefinedAreaDto> areas) {
        this.areas = areas;
    }
}
