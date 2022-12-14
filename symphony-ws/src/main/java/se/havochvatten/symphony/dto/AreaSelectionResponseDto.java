package se.havochvatten.symphony.dto;

import java.util.ArrayList;
import java.util.List;

public class AreaSelectionResponseDto {

    public static class Matrix {
        Integer id;
        String name;
        boolean immutable;

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

        public boolean isImmutable() { return immutable; }

        public void setImmutable(boolean immutable) { this.immutable = immutable; }
    }

    public static class Area {
        Integer id;
        String name;
        Matrix defaultMatrix;
        List<Matrix> matrices;

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

        public Matrix getDefaultMatrix() {
            return defaultMatrix;
        }

        public void setDefaultMatrix(Matrix defaultMatrix) {
            this.defaultMatrix = defaultMatrix;
        }

        public List<Matrix> getMatrices() {
            if (matrices == null) {
                matrices = new ArrayList<>();
            }
            return matrices;
        }
    }

    public static class DefaultArea extends Area {
        List<Matrix> userDefinedMatrices;
        List<Matrix> commonBaselineMatrices;

        public void setAreaAttributes(Area area) {
            this.setId(area.getId());
            this.setName(area.getName());
            this.setDefaultMatrix(area.getDefaultMatrix());
            this.getMatrices().addAll(area.getMatrices());
        }

        public List<Matrix> getUserDefinedMatrices() {
            if (userDefinedMatrices == null) {
                userDefinedMatrices = new ArrayList<>();
            }
            return userDefinedMatrices;
        }

        public List<Matrix> getCommonBaselineMatrices() {
            if (commonBaselineMatrices == null) {
                commonBaselineMatrices = new ArrayList<>();
            }
            return commonBaselineMatrices;
        }
    }

    public static class AreaTypeArea {
        Integer id;
        String name;
        boolean coastalArea;
        List<Area> areas;

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

        public boolean isCoastalArea() {
            return coastalArea;
        }

        public void setCoastalArea(boolean coastalArea) {
            this.coastalArea = coastalArea;
        }

        public List<Area> getAreas() {
            if (areas == null) {
                areas = new ArrayList<>();
            }
            return areas;
        }
    }

    DefaultArea defaultArea;
    List<AreaTypeArea> areaTypes;

    public DefaultArea getDefaultArea() {
        return defaultArea;
    }

    public void setDefaultArea(DefaultArea defaultArea) {
        this.defaultArea = defaultArea;
    }

    public List<AreaTypeArea> getAreaTypes() {
        if (areaTypes == null) {
            areaTypes = new ArrayList<>();
        }
        return areaTypes;
    }
}
