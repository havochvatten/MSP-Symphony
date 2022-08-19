package se.havochvatten.symphony.entity;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.vladmihalcea.hibernate.type.array.LongArrayType;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.gce.geotiff.GeoTiffReader;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.hibernate.annotations.TypeDefs;
import org.opengis.feature.simple.SimpleFeature;
import se.havochvatten.symphony.scenario.Scenario;
import se.havochvatten.symphony.scenario.ScenarioSnapshot;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlRootElement;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "calculationresult")
@XmlRootElement
@NamedQueries({
        @NamedQuery(name = "CalculationResult.findAll",
                query = "SELECT c FROM CalculationResult c"),
        @NamedQuery(name = "CalculationResult.findAllExceptBaseline",
                query = "SELECT c FROM CalculationResult c WHERE c.baselineCalculation = FALSE"),
        @NamedQuery(name = "CalculationResult.findBaselineCalculationsByBaselineId",
                query = "SELECT NEW se.havochvatten.symphony.dto.CalculationResultSlice(c.id, c" +
                        ".calculationName, c.timestamp) FROM " +
                        "CalculationResult c WHERE c.baselineVersion.id = : id and c.baselineCalculation = " +
                        "TRUE"),
        @NamedQuery(name = "CalculationResult.findByOwner",
                query = "SELECT NEW se.havochvatten.symphony.dto.CalculationResultSlice(c.id, c" +
                        ".calculationName, c.timestamp) FROM " +
                        "CalculationResult c WHERE c.owner = :username ORDER BY c.timestamp DESC"),
        @NamedQuery(name = "CalculationResult.findFullByOwner",
                query = "SELECT c FROM CalculationResult c WHERE c.owner = :username ORDER BY c.timestamp " +
                        "DESC")
})
@TypeDefs({
        @TypeDef(
                name = "long-matrix",
                typeClass = LongArrayType.class
        )
})
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class CalculationResult implements Serializable {
    private static final long serialVersionUID = 1L;

    @SequenceGenerator(name = "cares_seq", sequenceName = "cares_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "cares_seq")
    @Basic(optional = false)
    @NotNull
    @Column(name = "cares_id")
    @Id
    private Integer id;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "cares_op")
    private String operation;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "cares_owner")
    private String owner;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "cares_calculationname")
    private String calculationName;

    // See https://vladmihalcea.com/multidimensional-array-jpa-hibernate/
    @Basic(optional = false)
    @NotNull
    @Type(type = "long-matrix")
    @Column(name = "cares_impactmatrix", columnDefinition = "bigint[][]")
    private long[][] impactMatrix;

    @Basic(optional = true)
    @Column(name = "cares_geotiff", columnDefinition = "bytea")
    private byte[] rasterData;

    @Basic(optional = false)
    @NotNull
    @Column(name = "cares_timestamp")
    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp;

    @Column(name = "cares_normalizationvalue")
    private Double normalizationValue;

    @OneToOne
    @NotNull
    private ScenarioSnapshot scenarioSnapshot;

    @JoinColumn(name = "cares_bver_id", referencedColumnName = "bver_id")
    @ManyToOne(optional = false)
    private BaselineVersion baselineVersion;

    // TODO Replace this flag with separate BaseLineCalculationResult entity inheriting from this entity
    @Basic(optional = false)
    @NotNull
    @Column(name = "cares_baselinecalculation")
    private boolean baselineCalculation;

    public CalculationResult() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String username) {
        owner = username;
    }

    public String getCalculationName() {
        return calculationName;
    }

    public void setCalculationName(String calculationName) {
        this.calculationName = calculationName;
    }

    public byte[] getRasterData() {
        return rasterData;
    }

    public void setRasterData(byte[] data) {
        rasterData = data;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }

    public Double getNormalizationValue() {
        return normalizationValue;
    }

    public void setNormalizationValue(Double value) {
        this.normalizationValue = value;
    }

    public long[][] getImpactMatrix() {
        return impactMatrix;
    }

    public void setImpactMatrix(long[][] impactMatrix) {
        this.impactMatrix = impactMatrix;
    }

    @Transient
    private GridCoverage2D coverage;

    public void setCoverage(GridCoverage2D coverage) {
        this.coverage = coverage;
    }

    public GridCoverage2D getCoverage() {
        if (coverage != null) return coverage; // transient case
        else {
            // if getRasterData returns null we could also redo the calculation here (but notify the user
            // first)
            try {
                return new GeoTiffReader(new ByteArrayInputStream(getRasterData())).read(null);
            } catch (IOException e) {
                return null;
            }
        }
    }

    public BaselineVersion getBaselineVersion() {
        return baselineVersion;
    }

    public void setBaselineVersion(BaselineVersion baselineVersion) {
        this.baselineVersion = baselineVersion;
    }

    public boolean isBaselineCalculation() {
        return baselineCalculation;
    }

    public void setBaselineCalculation(boolean baselineCalculation) {
        this.baselineCalculation = baselineCalculation;
    }

    public void setScenarioSnapshot(ScenarioSnapshot scenario) {
        this.scenarioSnapshot = scenario;
    }

    public Scenario getScenarioSnapshot() {
        return scenarioSnapshot;
    }

    public void setOperation(String operation) { this.operation = operation; }

    @JsonIgnore
    public SimpleFeature getFeature() {
        return getScenarioSnapshot().getFeature();
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
        if (!(object instanceof CalculationResult)) {
            return false;
        }
        CalculationResult other = (CalculationResult) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "se.havochvatten.symphony.entity.CalculationResult [ id=" + id + " ]";
    }
}
