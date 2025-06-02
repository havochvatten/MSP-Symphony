package se.havochvatten.symphony.entity;

import org.hibernate.annotations.Formula;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "reliabilitypartition", schema = "symphony")
public class ReliabilityPartition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rp_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rp_metaband_id", nullable = false)
    private SymphonyBand band;

    @NotNull
    @Column(name = "rp_value", nullable = false)
    private Integer value;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rp_metaband_id", insertable = false, updatable = false)
    private SymphonyBand rpMetaband;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public SymphonyBand getBand() {
        return band;
    }

    public void setBand(SymphonyBand band) {
        this.band = band;
    }

    public Integer getValue() {
        return value;
    }

    public void setValue(Integer value) {
        this.value = value;
    }

    @Formula(value = "(SELECT ST_AsGeoJSON(u2.rp_polygon) FROM reliabilitypartition u2 WHERE u2.rp_id = rp_id)")
    private String polygon;

    public SymphonyBand getRpMetaband() {
        return rpMetaband;
    }

    public void setRpMetaband(SymphonyBand rpMetaband) {
        this.rpMetaband = rpMetaband;
    }

    public String getPolygon() {
        return polygon;
    }
}
