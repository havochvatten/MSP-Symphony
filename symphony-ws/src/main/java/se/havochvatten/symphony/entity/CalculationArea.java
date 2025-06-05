package se.havochvatten.symphony.entity;

import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;
import java.io.Serializable;
import java.util.List;

@Entity
@Table(name = "calculationarea")
@XmlRootElement
@NamedQuery(name = "CalculationArea.findAll", query = "SELECT c FROM CalculationArea c")
@NamedQuery(name = "CalculationArea.findByBaselineName", query = "SELECT c FROM CalculationArea c " +
        "WHERE c.defaultSensitivityMatrix.baselineVersion.name = :name")
@NamedQuery(name = "CalculationArea.findCalibratedByBaselineName", query = "SELECT c FROM CalculationArea c " +
        "WHERE c.defaultSensitivityMatrix.baselineVersion.name = :name AND c.maxValue IS NOT NULL")
@NamedQuery(name = "CalculationArea.findByIds", query = "SELECT c FROM CalculationArea c " +
        "WHERE c.id IN :ids")
@NamedNativeQuery(name = "CalculationArea.findByScenarioArea",
        query = "SELECT c.* FROM calculationarea c " +
                "JOIN sensitivitymatrix smx ON smx.sensm_id = c.carea_default_sensm_id " +
                "AND smx.sensm_bver_id = :versionId " +
                "JOIN capolygon cap ON cap.cap_carea_id = c.carea_id AND " +
                "ST_Intersects((SELECT polygon FROM scenarioarea WHERE id = :scenarioAreaId), cap.pg_polygon)",
        resultClass = CalculationArea.class)
public class CalculationArea implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	@Basic(optional = false)
	@Column(name = "carea_id")
	private Integer id;

	@Basic(optional = false)
	@NotNull
	@Size(min = 1, max = 2147483647)
	@Column(name = "carea_name")
	private String name;

	@Basic(optional = false)
	@NotNull
	@Column(name = "carea_default")
	private boolean careaDefault;

	@Column(name = "carea_maxvalue")
	private Double maxValue;

	@Fetch(FetchMode.SELECT)
	@OneToMany(mappedBy = "calculationArea", cascade = CascadeType.ALL, orphanRemoval = true, fetch =
			FetchType.EAGER)
	private List<CaPolygon> caPolygonList;

	@Fetch(FetchMode.SELECT)
	@OneToMany(mappedBy = "calculationArea", fetch = FetchType.EAGER)
	private List<CalcAreaSensMatrix> calcAreaSensMatrixList;

	@JoinColumn(name = "carea_default_sensm_id", referencedColumnName = "sensm_id")
	@ManyToOne
	private SensitivityMatrix defaultSensitivityMatrix;

	@JoinColumn(name = "carea_atype_id", referencedColumnName = "atype_id")
	@ManyToOne(optional = true)
	private AreaType areaType;

    public CalculationArea() {}

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

	public boolean isCareaDefault() {
		return careaDefault;
	}

	public void setCareaDefault(boolean careaDefault) {
		this.careaDefault = careaDefault;
	}

	public List<CaPolygon> getCaPolygonList() {
		return caPolygonList;
	}

	public void setCaPolygonList(List<CaPolygon> caPolygonList) {
		this.caPolygonList = caPolygonList;
	}

	@XmlTransient
	public List<CalcAreaSensMatrix> getCalcAreaSensMatrixList() {
		return calcAreaSensMatrixList;
	}

	public void setCalcAreaSensMatrixList(List<CalcAreaSensMatrix> calcAreaSensMatrixList) {
		this.calcAreaSensMatrixList = calcAreaSensMatrixList;
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
		if (!(object instanceof CalculationArea other)) {
			return false;
		}
        return (this.id != null || other.id == null) && (this.id == null || this.id.equals(other.id));
    }

	@Override
	public String toString() {
		return "se.havochvatten.symphonyws.entity.Calculationarea[ careaId=" + id + " ]";
	}

	public SensitivityMatrix getDefaultSensitivityMatrix() {
		return defaultSensitivityMatrix;
	}

	public void setdefaultSensitivityMatrix(SensitivityMatrix careaDefaultSensmId) {
		this.defaultSensitivityMatrix = careaDefaultSensmId;
	}

	public AreaType getAreaType() {
		return areaType;
	}

	public void setAreaType(AreaType areaType) {
		this.areaType = areaType;
	}

	public Double getMaxValue() {
		return maxValue;
	}

	public void setMaxValue(Double maxValue) {
		this.maxValue = maxValue;
	}

}
