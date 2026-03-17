package se.havochvatten.symphony.dto;

import se.havochvatten.symphony.entity.UserDefinedAreaCategory;

public class UserDefinedAreaDto {
    private Integer id;
    private String name;
    private String description;
    private Object polygon;
    private Integer categoryId;

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Object getPolygon() {
        return polygon;
    }

    public void setPolygon(Object polygon) {
        this.polygon = polygon;
    }

    public Integer getCategoryId(){
        return categoryId;
    }

    public void setCategoryId(Integer categoryId){
        this.categoryId = categoryId;
    }
}
