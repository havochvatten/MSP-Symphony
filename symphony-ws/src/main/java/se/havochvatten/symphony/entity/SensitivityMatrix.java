package se.havochvatten.symphony.entity;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;
import java.io.Serializable;
import java.util.List;

@Entity
@Table(name = "sensitivitymatrix")
@XmlRootElement
@NamedQueries({
		@NamedQuery(name = "SensitivityMatrix.findAll", query = "SELECT s FROM SensitivityMatrix s"),
		@NamedQuery(name = "SensitivityMatrix.findById",
				query = "SELECT s FROM SensitivityMatrix s WHERE s.id = :id"),
		@NamedQuery(name = "SensitivityMatrix.findBySensmName",
				query = "SELECT s FROM SensitivityMatrix s WHERE s.name = :name"),
		@NamedQuery(name = "SensitivityMatrix.findByBaselineName",
				query = "SELECT s FROM SensitivityMatrix s WHERE s.baselineVersion.name = :name"),
		@NamedQuery(name = "SensitivityMatrix.findByMatrixNameAndOwnerAndBaseline",
				query = "SELECT s " +
						"FROM SensitivityMatrix s WHERE s.owner = :matrixName AND s.owner = :owner AND s" +
						".baselineVersion" +
						".name = :baseLineName"),
		@NamedQuery(name = "SensitivityMatrix.findByBaselineNameAndOwner",
				query = "SELECT s FROM " +
						"SensitivityMatrix s WHERE s.baselineVersion.name = :name AND s.owner = :owner")
})
public class SensitivityMatrix implements Serializable {
    private static final long serialVersionUID = 1L;

    @OneToMany(mappedBy = "defaultSensitivityMatrix")
    private List<CalculationArea> defaultCalculationAreaList;

    @Id
    @SequenceGenerator(name = "sensm_seq", sequenceName = "sensm_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE,
            generator = "sensm_seq")
    @Basic(optional = false)
    @NotNull
    @Column(name = "sensm_id")
    private Integer id;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 2147483647)
    @Column(name = "sensm_name")
    private String name;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "sensitivityMatrix")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private List<Sensitivity> sensitivityList;

    @OneToMany(mappedBy = "sensitivityMatrix")
    private List<CalcAreaSensMatrix> calcAreaSensMatrixList;

    @JoinColumn(name = "sensm_bver_id", referencedColumnName = "bver_id")
    @ManyToOne(optional = false)
    private BaselineVersion baselineVersion;

    @Column(name = "sensm_owner")
    private String owner;

    public SensitivityMatrix() {}

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

    @XmlTransient
    public List<Sensitivity> getSensitivityList() {
        return sensitivityList;
    }

    public void setSensitivityList(List<Sensitivity> sensitivityList) {
        this.sensitivityList = sensitivityList;
    }

    public BaselineVersion getBaselineVersion() {
        return baselineVersion;
    }

    public void setBaselineVersion(BaselineVersion baselineVersion) {
        this.baselineVersion = baselineVersion;
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
        if (!(object instanceof SensitivityMatrix)) {
            return false;
        }
        SensitivityMatrix other = (SensitivityMatrix) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "se.havochvatten.symphonyws.entity.Sensitivitymatrix[ sensmId=" + id + " ]";
    }

    @XmlTransient
    public List<CalcAreaSensMatrix> getCalcAreaSensMatrixList() {
        return calcAreaSensMatrixList;
    }

    public void setCalcAreaSensMatrixList(List<CalcAreaSensMatrix> calcAreaSensMatrixList) {
        this.calcAreaSensMatrixList = calcAreaSensMatrixList;
    }

    @XmlTransient
    public List<CalculationArea> getDefaultCalculationAreaList() {
        return defaultCalculationAreaList;
    }

    public void setDefaultCalculationAreaList(List<CalculationArea> defaultCalculationAreaList) {
        this.defaultCalculationAreaList = defaultCalculationAreaList;
    }

}
