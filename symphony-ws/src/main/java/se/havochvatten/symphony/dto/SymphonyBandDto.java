package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import se.havochvatten.symphony.entity.SymphonyBand;

import java.util.HashMap;
import java.util.Map;

public class SymphonyBandDto {
    Integer id;
    int bandNumber;
    boolean selected;

    @JsonProperty("reliability")
    ReliabilityMapping reliabilityMapping = null;

    @JsonIgnore
    LayerType _symphonyCategory;

    @JsonIgnore
    boolean defaultSelected;

    public SymphonyBandDto() {}

    public SymphonyBandDto(SymphonyBand b, boolean withReliability) {
        this.id = b.getId();
        this.bandNumber = b.getBandNumber();
        this.defaultSelected = b.isDefaultSelected();
        this._symphonyCategory =
            b.getCategory().toUpperCase().equals(LayerType.ECOSYSTEM.toString()) ?
                LayerType.ECOSYSTEM : LayerType.PRESSURE;
        this.selected = this.defaultSelected;
        if (withReliability && !b.getReliabilityPartitions().isEmpty()) {
            this.reliabilityMapping =
                new ReliabilityMapping(b.getReliabilityPartitions());
        }
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

    @JsonInclude
    public String getSymphonyCategory() {
        return _symphonyCategory.toString();
    }

    @JsonIgnore
    public boolean isDefaultSelected() {
        return defaultSelected;
    }

    public int getBandNumber() {
        return bandNumber;
    }

    public boolean isSelected() {
        return selected;
    }

    public ReliabilityMapping getReliability() {
        return reliabilityMapping;
    }

    public void setSelected(boolean selected) { this.selected = selected; }

}
