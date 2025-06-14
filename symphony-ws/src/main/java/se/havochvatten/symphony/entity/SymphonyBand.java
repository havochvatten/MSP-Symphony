package se.havochvatten.symphony.entity;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.xml.bind.annotation.XmlTransient;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "meta_bands", indexes = {
    @Index(name = "metaband_uq", columnList = "metaband_bver_id, metaband_category, metaband_number", unique = true)
})
public class SymphonyBand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "metaband_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "metaband_bver_id", nullable = false)
    private BaselineVersion baseline;

    @Size(max = 64)
    @NotNull
    @Column(name = "metaband_category", nullable = false, length = 64)
    private String category;

    @NotNull
    @Column(name = "metaband_number", nullable = false)
    private Integer bandnumber;

    @NotNull
    @Column(name = "metaband_default_selected", nullable = false)
    private Boolean defaultSelected = false;

    @OneToMany(mappedBy = "band", fetch = FetchType.LAZY)
    private Set<Metadata> metaValues = new LinkedHashSet<>();

    @OneToMany(mappedBy = "pressureBand")
    private Set<Sensitivity> pressureSensitivities = new LinkedHashSet<>();

    @OneToMany(mappedBy = "ecoBand")
    private Set<Sensitivity> ecoSensitivities = new LinkedHashSet<>();

    @OneToMany(mappedBy = "rpMetaband", fetch = FetchType.LAZY)
    private Set<ReliabilityPartition> reliabilityPartitions = new LinkedHashSet<>();

    public Set<ReliabilityPartition> getReliabilityPartitions() {
        return reliabilityPartitions;
    }

    @XmlTransient
    public Set<Sensitivity> getPressureSensitivities() {
        return pressureSensitivities;
    }

    public void setPressureSensitivities(Set<Sensitivity> pressureSensitivities) {
        this.pressureSensitivities = pressureSensitivities;
    }

    @XmlTransient
    public Set<Sensitivity> getEcoSensitivities() {
        return ecoSensitivities;
    }

    public void setEcoSensitivities(Set<Sensitivity> ecoSensitivities) {
        this.ecoSensitivities = ecoSensitivities;
    }

    public Set<Metadata> getMetaValues() {
        return metaValues;
    }

    public Integer getId() {
        return id;
    }

    public BaselineVersion getBaseline() {
        return baseline;
    }

    public String getCategory() {
        return category;
    }

    public Integer getBandNumber() {
        return bandnumber;
    }

    public boolean isDefaultSelected() {
        return defaultSelected;
    }

    public String getTitle(String preferredLanguage) {
        return metaValues.stream().filter(m -> m.getMetaField().equals("title"))
            .filter(m -> m.getLanguage().equals(preferredLanguage))
            .map(Metadata::getMetaValue).findFirst().orElse(
                metaValues.stream().filter(m -> m.getMetaField().equals("title"))
                .map(Metadata::getMetaValue).findFirst().orElse("Band " + bandnumber));
    }

    // Exposure of setters for unit testing
    public void setId(Integer id) {
        this.id = id;
    }
    public void setBaseline(BaselineVersion baseline) {
        this.baseline = baseline;
    }
    public void setCategory(String category) {
        this.category = category;
    }
    public void setBandNumber(Integer bandnumber) {
        this.bandnumber = bandnumber;
    }
}
