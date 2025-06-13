package se.havochvatten.symphony.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;

@Entity
@Table(name = "nationalarea")
@XmlRootElement
@NamedQuery(name = "NationalArea.findAll", query = "SELECT n FROM NationalArea n")
@NamedQuery(name = "NationalArea.findByCountryIso3AndType", query = "SELECT n FROM NationalArea n " +
        "WHERE n.countryIso3 = :countryIso3 and n.type = :type")
public class NationalArea implements Serializable { // TODO Rename to Areas
	private static final long serialVersionUID = 1L;

    @Id
    @Basic(optional = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "narea_id", nullable = false)
    private Integer id;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 2147483647)
    @Column(name = "narea_countryiso3")
    private String countryIso3;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 2147483647)
    @Column(name = "narea_type")
    private String type;

    @Size(min = 1, max = 2147483647)
    @Column(name = "narea_types")
    private String typesJson;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 2147483647)
    @Column(name = "narea_areas")
    private String areasJson;

    public NationalArea() {}

    public NationalArea(Integer id) {
        this.id = id;
    }

    public NationalArea(Integer id, String countryIso3, String areasJson) {
        this.id = id;
        this.countryIso3 = countryIso3;
        this.areasJson = areasJson;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCountryIso3() {
        return countryIso3;
    }

    public void setCountryIso3(String countryIso3) {
        this.countryIso3 = countryIso3;
    }

    public String getAreasJson() {
        return areasJson;
    }

    public void setAreasJson(String areasJson) {
        this.areasJson = areasJson;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTypesJson() {
        return typesJson;
    }

    public void setTypesJson(String typesJson) {
        this.typesJson = typesJson;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof NationalArea other)) {
            return false;
        }
        return (this.id != null || other.id == null) && (this.id == null || this.id.equals(other.id));
    }

    @Override
    public String toString() {
        return "se.havochvatten.symphonyws.entity.Nationalarea[ nareaId=" + id + " ]";
    }
}
