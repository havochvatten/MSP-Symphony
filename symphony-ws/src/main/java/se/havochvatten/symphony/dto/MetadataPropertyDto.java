package se.havochvatten.symphony.dto;

import se.havochvatten.symphony.entity.SymphonyBand;

import java.util.HashMap;
import java.util.Map;

public class MetadataPropertyDto {
    Integer id;
    int bandNumber;
    boolean defaultSelected;

    public MetadataPropertyDto() {}

    public MetadataPropertyDto(SymphonyBand b) {
        this.id = b.getId();
        this.bandNumber = b.getBandNumber();
        this.defaultSelected = b.isDefaultSelected();
    }

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
        String title = meta.get("title");
        return title == null ? "Band " + bandNumber : title;
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
