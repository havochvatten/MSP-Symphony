package se.havochvatten.symphony.entity;

import org.hibernate.annotations.Type;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Entity
@Table(name = "meta_values", indexes = {
    @Index(name = "metavalue_uq", columnList = "metaval_band_id, metaval_language, metaval_field", unique = true)
})
public class Metadata {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "metaval_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "metaval_band_id", nullable = false)
    private SymphonyBand band;

    @Size(max = 2)
    @NotNull
    @Column(name = "metaval_language", nullable = false, length = 2)
    private String language;

    @Size(max = 255)
    @NotNull
    @Column(name = "metaval_field", nullable = false)
    private String metaField;

    @NotNull
    @Column(name = "metaval_value", nullable = false)
    @Type(type = "org.hibernate.type.TextType")
    private String metaValue;

    public Integer getId() {
        return id;
    }

    public SymphonyBand getBand() {
        return band;
    }

    public String getLanguage() {
        return language;
    }

    public String getMetaField() {
        return metaField;
    }

    public String getMetaValue() {
        return metaValue;
    }

    // Exposure of setters for unit testing
    public void setId(Integer id) {
        this.id = id;
    }

    public void setBand(SymphonyBand band) {
        this.band = band;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public void setMetaField(String metaField) {
        this.metaField = metaField;
    }

    public void setMetaValue(String metaValue) {
        this.metaValue = metaValue;
    }

}
