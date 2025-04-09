package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.List;

public class AreaSelectionResponseDto {

    public static class Area {
        Integer id;
        String name;
        MatrixSelection defaultMatrix;
        List<MatrixSelection> matrices;

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

        public MatrixSelection getDefaultMatrix() {
            return defaultMatrix;
        }

        public void setDefaultMatrix(MatrixSelection defaultMatrix) {
            this.defaultMatrix = defaultMatrix;
        }

        public List<MatrixSelection> getMatrices() {
            if (matrices == null) {
                matrices = new ArrayList<>();
            }
            return matrices;
        }
    }

    public static class DefaultArea extends Area {
        List<MatrixSelection> userDefinedMatrices;
        List<MatrixSelection> commonBaselineMatrices;

        public void setAreaAttributes(Area area) {
            this.setId(area.getId());
            this.setName(area.getName());
            this.setDefaultMatrix(area.getDefaultMatrix());
            this.getMatrices().addAll(area.getMatrices());
        }

        public List<MatrixSelection> getUserDefinedMatrices() {
            if (userDefinedMatrices == null) {
                userDefinedMatrices = new ArrayList<>();
            }
            return userDefinedMatrices;
        }

        public List<MatrixSelection> getCommonBaselineMatrices() {
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

    public static class AreaOverlapFragment {
        private JsonNode polygon;
        private MatrixSelection defaultMatrix;

        public JsonNode getPolygon() {
            return polygon;
        }

        public void setPolygon(JsonNode polygon) {
            this.polygon = polygon;
        }

        public MatrixSelection getDefaultMatrix() {
            return defaultMatrix;
        }

        public void setDefaultMatrix(MatrixSelection defaultMatrix) {
            this.defaultMatrix = defaultMatrix;
        }
    }

    DefaultArea defaultArea;
    List<AreaTypeArea> areaTypes;
    List<AreaOverlapFragment> overlap;
    List<MatrixSelection> alternativeMatrices; // set only if no matrices are found

    public DefaultArea getDefaultArea() {
        return defaultArea;
    }

    public void setDefaultArea(DefaultArea defaultArea) {
        this.defaultArea = defaultArea;
    }

    public void setOverlap(List<AreaOverlapFragment> areaOverlapFragments) {
        this.overlap = areaOverlapFragments;
    }

    public void setAlternativeMatrices(List<MatrixSelection> alternativeMatrices) {
        this.alternativeMatrices = alternativeMatrices;
    }

    public List<AreaTypeArea> getAreaTypes() {
        if (areaTypes == null) {
            areaTypes = new ArrayList<>();
        }
        return areaTypes;
    }

    public List<AreaOverlapFragment> getOverlap() {
        if (overlap == null) {
            overlap = new ArrayList<>();
        }
        return overlap;
    }

    public List<MatrixSelection> getAlternativeMatrices() {
        return alternativeMatrices;
    }
}
