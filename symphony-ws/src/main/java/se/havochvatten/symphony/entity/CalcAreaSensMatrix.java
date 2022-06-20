package se.havochvatten.symphony.entity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;

@Entity
@Table(name = "calcareasensmatrix")
@XmlRootElement
@NamedQueries({
	@NamedQuery(name = "CalcAreaSensMatrix.findAll", query = "SELECT c FROM CalcAreaSensMatrix c"),
	@NamedQuery(name = "CalcAreaSensMatrix.findByBaselineAndOwner", query = "SELECT c FROM CalcAreaSensMatrix c WHERE c.sensitivityMatrix.baselineVersion.name = :baseline AND c.sensitivityMatrix.owner = :owner"),
	@NamedQuery(name = "CalcAreaSensMatrix.findByBaselineAndOwnerAndArea", query = "SELECT c FROM CalcAreaSensMatrix c WHERE c.sensitivityMatrix.baselineVersion.name = :baselineName AND c.sensitivityMatrix.owner = :owner AND c.calculationArea.id = :calcAreaId"),
	@NamedQuery(name = "CalcAreaSensMatrix.findByMatrixIdAndOwner", query = "SELECT c FROM CalcAreaSensMatrix c WHERE c.sensitivityMatrix.id = :matrixId AND c.sensitivityMatrix.owner = :owner")
	})
public class CalcAreaSensMatrix implements Serializable {

	private static final long serialVersionUID = 1L;
	@Id
	@SequenceGenerator(name = "casen_seq", sequenceName = "casen_seq", allocationSize = 1)
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "casen_seq")
	@Basic(optional = false)
	@NotNull
	@Column(name = "casen_id")
	private Integer id;

	@Size(max = 2147483647)
	@Column(name = "casen_comment")
	private String comment;

	@JoinColumn(name = "casen_carea_id", referencedColumnName = "carea_id")
	@ManyToOne(optional = false)
	private CalculationArea calculationArea;

	@JoinColumn(name = "casen_sensm_id", referencedColumnName = "sensm_id")
	@ManyToOne
	private SensitivityMatrix sensitivityMatrix;

	public CalcAreaSensMatrix() {}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	public CalculationArea getCalculationArea() {
		return calculationArea;
	}

	public void setCalculationArea(CalculationArea calculationArea) {
		this.calculationArea = calculationArea;
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
		if (!(object instanceof CalcAreaSensMatrix)) {
			return false;
		}
		CalcAreaSensMatrix other = (CalcAreaSensMatrix) object;
		if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
			return false;
		}
		return true;
	}

	@Override
	public String toString() {
		return "se.havochvatten.symphonyws.entity.Calcareasensmatrix[ casenId=" + id + " ]";
	}

}
