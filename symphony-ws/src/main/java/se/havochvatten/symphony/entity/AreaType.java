/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package se.havochvatten.symphony.entity;

import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;
import java.io.Serializable;
import java.util.List;

@Entity
@Table(name = "areatype")
@XmlRootElement
@NamedQuery(name = "AreaType.findAll", query = "SELECT a FROM AreaType a")
public class AreaType implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "atype_id")
    private Integer id;

    @Size(max = 2147483647)
    @Column(name = "atype_name")
    private String atypeName;

    @Column(name = "atype_coastalarea")
    private boolean coastalArea;

    @Fetch(FetchMode.SELECT)
    @OneToMany(mappedBy = "areaType", fetch = FetchType.EAGER)
    private List<CalculationArea> calculationAreas;

    public AreaType() {}

    public AreaType(Integer id) {
        this.id = id;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getAtypeName() {
        return atypeName;
    }

    public void setAtypeName(String atypeName) {
        this.atypeName = atypeName;
    }

    public boolean isCoastalArea() {
        return coastalArea;
    }

    public void setCoastalArea(boolean coastalArea) {
        this.coastalArea = coastalArea;
    }

    @XmlTransient
    public List<CalculationArea> getCalculationAreas() {
        return calculationAreas;
    }

    public void setCalculationAreas(List<CalculationArea> calculationAreas) {
        this.calculationAreas = calculationAreas;
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
        if (!(object instanceof AreaType other)) {
            return false;
        }

        return (this.id != null || other.id == null) && (this.id == null || this.id.equals(other.id));
    }

    @Override
    public String toString() {
        return "se.havochvatten.symphonyws.entity.Areatype[ id=" + id + " ]";
    }
}
