package se.havochvatten.symphony.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;

@Entity
@Table(name = "userdefarea")
@XmlRootElement
@NamedQuery(name = "UserDefinedArea.findAll", query = "SELECT u FROM UserDefinedArea u")
@NamedQuery(name = "UserDefinedArea.findAllByOwner",
        query = "SELECT u FROM UserDefinedArea u WHERE u.owner = :owner")
public class UserDefinedArea implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "uda_id", nullable = false)
    private Integer id;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 2147483647)
    @Column(name = "uda_name")
    private String name;

    @Size(max = 2147483647)
    @Column(name = "uda_description")
    private String description;

    @Basic(optional = false)
    @NotNull
    @Column(name = "uda_polygon")
    // TODO: Allow several polygons (i.e. a FeatureCollection)
	private String polygon; // GeoJSON

	@NotNull
    @Column(name = "uda_owner")
    private String owner;

    public UserDefinedArea() {}

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPolygon() {
        return polygon;
    }

    public void setPolygon(String polygon) {
        this.polygon = polygon;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
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
        if (!(object instanceof UserDefinedArea other)) {
            return false;
        }
        return (this.id != null || other.id == null) && (this.id == null || this.id.equals(other.id));
    }

    @Override
    public String toString() {
        return "se.havochvatten.symphonyws.entity.UserDefinedArea[ udaId=" + id + " ]";
    }
}
