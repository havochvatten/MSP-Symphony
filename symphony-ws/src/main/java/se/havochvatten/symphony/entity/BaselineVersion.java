package se.havochvatten.symphony.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;
import java.io.Serializable;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "baselineversion")
@XmlRootElement

@NamedQuery(name = "BaselineVersion.findAll", query = "SELECT s FROM BaselineVersion s")
@NamedQuery(name = "BaselineVersion.getByName", query = "SELECT s FROM BaselineVersion s WHERE s" +
        ".name = :name")
@NamedQuery(name = "BaselineVersion.getById", query = "SELECT s FROM BaselineVersion s WHERE s.id =" +
        " :id")
public class BaselineVersion implements Serializable {
    private static final long serialVersionUID = 1L;

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Id
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
    @Size(max = 10)
    @Column(name = "bver_locale")
    private String locale;

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
        if (!(object instanceof BaselineVersion other)) {
            return false;
        }
        return (this.id != null || other.id == null) && (this.id == null || this.id.equals(other.id));
    }

    @Override
    public String toString() {
        return "se.havochvatten.symphony.entity.BaselineVersion[ sverId=" + id + " ]";
    }

    @JsonIgnore
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

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }
}
