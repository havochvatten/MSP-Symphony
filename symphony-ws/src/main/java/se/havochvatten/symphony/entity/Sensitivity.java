package se.havochvatten.symphony.entity;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "sensitivity")
@XmlRootElement
@NamedQueries({
        @NamedQuery(name = "Sensitivity.findAll", query = "SELECT s FROM Sensitivity s"),
        @NamedQuery(name = "Sensitivity.findById", query = "SELECT s FROM Sensitivity s WHERE s.id = :is")
})
public class Sensitivity implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @SequenceGenerator(name = "sens_seq", sequenceName = "sens_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sens_seq")
    @Basic(optional = false)
    @NotNull
    @Column(name = "sens_id")
    private Integer id;

    @Basic(optional = false)
    @NotNull
    @Column(name = "sens_value")
    private BigDecimal value;

    @JoinColumn(name = "sens_eco_meta_id", referencedColumnName = "meta_id")
    @ManyToOne(optional = false)
    private Metadata ecoMetadata;

    @JoinColumn(name = "sens_pres_meta_id", referencedColumnName = "meta_id")
    @ManyToOne(optional = false)
    private Metadata presMetadata;

    @JoinColumn(name = "sens_sensm_id", referencedColumnName = "sensm_id")
    @ManyToOne(optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private SensitivityMatrix sensitivityMatrix;

    public Sensitivity() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public BigDecimal getValue() {
        return value;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }

    public Metadata getEcoMetadata() {
        return ecoMetadata;
    }

    public void setEcoMetadata(Metadata ecoMetadata) {
        this.ecoMetadata = ecoMetadata;
    }

    public Metadata getPresMetadata() {
        return presMetadata;
    }

    public void setPresMetadata(Metadata prresMetadata) {
        this.presMetadata = prresMetadata;
    }

    public SensitivityMatrix getSensitivityMatrix() {
        return sensitivityMatrix;
    }

    public void setSensitivityMatrix(SensitivityMatrix sensitivityMatrix) {
        this.sensitivityMatrix = sensitivityMatrix;
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
        if (!(object instanceof Sensitivity)) {
            return false;
        }
        Sensitivity other = (Sensitivity) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "se.havochvatten.symphonyws.entity.Sensitivity[ sensId=" + id + " ]";
    }

}
