package se.havochvatten.symphony.dto;

import java.util.HashMap;
import java.util.Map;

public class MetadataPropertyDto {
    Integer id;
    int bandNumber;
    String title;
    String titleLocal;
    boolean defaultSelected;
    Map<String, String> meta = new HashMap<>();

    public Map<String, String> getMeta() {
        return meta;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTitleLocal() {
        return titleLocal;
    }

    public void setTitleLocal(String titleLocal) {
        this.titleLocal = titleLocal;
    }

    public boolean isDefaultSelected() {
        return defaultSelected;
    }

    public void setDefaultSelected(boolean defaultselected) {
        this.defaultSelected = defaultselected;
    }

    public int getBandNumber() {
        return bandNumber;
    }

    public void setBandNumber(int bandnumber) {
        this.bandNumber = bandnumber;
    }

}
