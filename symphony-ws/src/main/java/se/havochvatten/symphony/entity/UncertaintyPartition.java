package se.havochvatten.symphony.entity;

import org.hibernate.annotations.Formula;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "uncertaintypartition", schema = "symphony")
public class UncertaintyPartition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "uce_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "uce_metaband_id", nullable = false)
    private SymphonyBand band;

    @NotNull
    @Column(name = "uce_value", nullable = false)
    private Integer value;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uce_metaband_id", insertable = false, updatable = false)
    private SymphonyBand uceMetaband;

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

    @Formula(value = "(SELECT ST_AsGeoJSON(u2.uce_polygon) FROM uncertaintypartition u2 WHERE u2.uce_id = uce_id)")
    private String polygon;

    public SymphonyBand getUceMetaband() {
        return uceMetaband;
    }

    public void setUceMetaband(SymphonyBand uceMetaband) {
        this.uceMetaband = uceMetaband;
    }

    public String getPolygon() {
        return polygon;
    }
}
