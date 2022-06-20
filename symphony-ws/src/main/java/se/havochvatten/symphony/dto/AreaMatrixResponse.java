package se.havochvatten.symphony.dto;

import org.locationtech.jts.geom.Geometry;

import java.util.ArrayList;
import java.util.List;

public class AreaMatrixResponse {
    Integer matrixId;
    boolean defaultArea;
    List<Geometry> polygons; // CRS: WGS84

    public List<Geometry> getPolygons() {
        if (polygons == null) {
            polygons = new ArrayList<>();
        }
        return polygons;
    }

    public Integer getMatrixId() {
        return matrixId;
    }

    public void setMatrixId(Integer matrixId) {
        this.matrixId = matrixId;
    }

    public boolean isDefaultArea() {
        return defaultArea;
    }

    public void setDefaultArea(boolean defaultArea) {
        this.defaultArea = defaultArea;
    }
}
