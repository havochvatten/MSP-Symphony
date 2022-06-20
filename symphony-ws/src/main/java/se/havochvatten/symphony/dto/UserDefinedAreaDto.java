package se.havochvatten.symphony.dto;

public class UserDefinedAreaDto {
    private Integer id;
    private String name;
    private String description;
    private Object polygon;

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
}
