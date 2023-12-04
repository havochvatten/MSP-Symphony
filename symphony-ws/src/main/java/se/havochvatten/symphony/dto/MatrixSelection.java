package se.havochvatten.symphony.dto;

public class MatrixSelection {
    Integer id;
    String name;
    boolean immutable;

    public MatrixSelection() {}

    public MatrixSelection(int id, String name, boolean immutable) {
        this.id = id;
        this.name = name;
        this.immutable = immutable;
    }

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

    public boolean isImmutable() {
        return immutable;
    }

    public void setImmutable(boolean immutable) {
        this.immutable = immutable;
    }
}
