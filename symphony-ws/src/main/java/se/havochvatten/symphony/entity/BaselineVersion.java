package se.havochvatten.symphony.entity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;
import java.io.Serializable;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "baselineversion")
@XmlRootElement
@NamedQueries({
        @NamedQuery(name = "BaselineVersion.findAll", query = "SELECT s FROM BaselineVersion s"),
        @NamedQuery(name = "BaselineVersion.getByName", query = "SELECT s FROM BaselineVersion s WHERE s" +
                ".name = :name"),
        @NamedQuery(name = "BaselineVersion.getById", query = "SELECT s FROM BaselineVersion s WHERE s.id =" +
                " :id")
})
public class BaselineVersion implements Serializable {
    private static final long serialVersionUID = 1L;

    @SequenceGenerator(name = "bver_seq", sequenceName = "bver_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "bver_seq")
    @Basic(optional = false)
    @Id
    @NotNull
    @Column(name = "bver_id")
    private Integer id;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 2147483647)
    @Column(name = "bver_name")
    private String name;

    @Size(max = 2147483647)
    @Column(name = "bver_desc")
    private String description;

    @Basic(optional = false)
    @NotNull
    @Column(name = "bver_validfrom")
    @Temporal(TemporalType.DATE)
    private Date validFrom;

    @OneToMany(mappedBy = "baselineVersion")
    private List<CalculationResult> calculationResultList;

    @Basic(optional = false)
    @NotNull
    @Column(name = "bver_ecofilepath")
    String ecosystemsFilePath;

    @Basic(optional = false)
    @NotNull
    @Column(name = "bver_presfilepath")
    String pressuresFilePath;

    public BaselineVersion() {}

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

    public Date getValidFrom() {
        return validFrom;
    }

    public void setValidFrom(Date validFrom) {
        this.validFrom = validFrom;
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
        if (!(object instanceof BaselineVersion)) {
            return false;
        }
        BaselineVersion other = (BaselineVersion) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "se.havochvatten.symphony.entity.BaselineVersion[ sverId=" + id + " ]";
    }

    @XmlTransient
    public List<CalculationResult> getCalculationResultList() {
        return calculationResultList;
    }

    public void setCalculationResultList(List<CalculationResult> calculationResultList) {
        this.calculationResultList = calculationResultList;
    }

    public String getEcosystemsFilePath() {
        return ecosystemsFilePath;
    }

    public void setEcosystemsFilePath(String ecosystemsFilePath) {
        this.ecosystemsFilePath = ecosystemsFilePath;
    }

    public String getPressuresFilePath() {
        return pressuresFilePath;
    }

    public void setPressuresFilePath(String pressuresFilePath) {
        this.pressuresFilePath = pressuresFilePath;
    }

}
