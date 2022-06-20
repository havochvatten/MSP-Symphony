/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package se.havochvatten.symphony.entity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;
import java.io.Serializable;

@Entity
@Table(name = "capolygon")
@XmlRootElement
@NamedQueries({
		@NamedQuery(name = "CaPolygon.findAll", query = "SELECT c FROM CaPolygon c"),
		@NamedQuery(name = "CaPolygon.findForBaselineVersionId",
				query = "SELECT c FROM CaPolygon c WHERE c" + ".calculationArea.defaultSensitivityMatrix" +
						".baselineVersion.id = :versionId")})
public class CaPolygon implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @SequenceGenerator(name = "cap_seq", sequenceName = "cap_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "cap_seq")
    @Basic(optional = false)
    @NotNull
    @Column(name = "cap_id")
    private Integer id;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 2147483647)
    @Column(name = "cap_polygon")
    private String polygon;

    @JoinColumn(name = "cap_carea_id", referencedColumnName = "carea_id")
    @ManyToOne(optional = false)
    private CalculationArea calculationArea;

    public CaPolygon() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getPolygon() {
        return polygon;
    }

    public void setPolygon(String polygon) {
        this.polygon = polygon;
    }

    @XmlTransient
    public CalculationArea getCalculationArea() {
        return calculationArea;
    }

    public void setCalculationArea(CalculationArea calculationArea) {
        this.calculationArea = calculationArea;
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
        if (!(object instanceof CaPolygon)) {
            return false;
        }
        CaPolygon other = (CaPolygon) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "se.havochvatten.symphonyws.entity.Capolygon[ capId=" + id + " ]";
    }
}
