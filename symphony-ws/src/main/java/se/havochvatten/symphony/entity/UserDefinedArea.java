package se.havochvatten.symphony.entity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;

@Entity
@Table(name = "userdefarea")
@XmlRootElement
@NamedQueries({
        @NamedQuery(name = "UserDefinedArea.findAll", query = "SELECT u FROM UserDefinedArea u"),
        @NamedQuery(name = "UserDefinedArea.findAllByOwner",
				query = "SELECT u FROM UserDefinedArea u WHERE u.owner = :owner")
})
public class UserDefinedArea implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @SequenceGenerator(name = "uda_seq", sequenceName = "uda_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "uda_seq")
    @Basic(optional = false)
    @NotNull
    @Column(name = "uda_id")
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
        if (!(object instanceof UserDefinedArea)) {
            return false;
        }
        UserDefinedArea other = (UserDefinedArea) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "se.havochvatten.symphonyws.entity.UserDefinedArea[ udaId=" + id + " ]";
    }
}
