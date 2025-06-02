package se.havochvatten.symphony.entity;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import io.hypersistence.utils.hibernate.type.array.DoubleArrayType;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.gce.geotiff.GeoTiffReader;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;
import se.havochvatten.symphony.service.CalcService;
import se.havochvatten.symphony.dto.CalculationResultSliceDto;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.Serializable;
import java.util.Date;
import java.util.Map;

import static se.havochvatten.symphony.util.CalculationUtil.operationName;

@Entity
@Table(name = "calculationresult")
@XmlRootElement
@NamedQuery(name = "CalculationResult.findAll",
        query = "SELECT c FROM CalculationResult c")
@NamedQuery(name = "CalculationResult.findAllExceptBaseline",
        query = "SELECT c FROM CalculationResult c WHERE c.baselineCalculation = FALSE")
@NamedQuery(name = "CalculationResult.findBaselineCalculationsByBaselineId",
        query = "SELECT NEW se.havochvatten.symphony.dto.CalculationResultSliceDto(c.id, c" +
                ".calculationName, c.timestamp, (c.rasterData = null)) FROM " +
                "CalculationResult c WHERE c.baselineVersion.id = : id and c.baselineCalculation = " +
                "TRUE")
@NamedQuery(name = "CalculationResult.findFullByOwner",
        query = "SELECT c FROM CalculationResult c WHERE c.owner = :username ORDER BY c.timestamp " +
                "DESC")
@NamedQuery(name = "CalculationResult.removeOldCalculationTiff",
        query = "UPDATE CalculationResult c SET c.rasterData = null WHERE c.timestamp < :timestamp")
@NamedQuery(name = "CalculationResult.findByIds_Owner_Baseline",
        query = "SELECT c FROM CalculationResult c WHERE c.id IN :ids AND c.owner = :username AND " +
                "c.baselineVersion.id = :baselineId")

@SqlResultSetMapping(
    name = "CalculationCmpMapping",
    classes = @ConstructorResult(
        targetClass = CalculationResultSliceDto.class,
        columns = {
            @ColumnResult(name="cares_id", type=Integer.class),
            @ColumnResult(name="cares_calculationname", type=String.class),
            @ColumnResult(name="cares_timestamp", type=Date.class),
            @ColumnResult(name="haschanges", type=Boolean.class),
            @ColumnResult(name="polygon", type=String.class),
            @ColumnResult(name="ecosystems", type=int[].class),
            @ColumnResult(name="pressures", type=int[].class)
        }
    )
)

@NamedNativeQuery(name = "CalculationResult.findCmpByOwner",
    query = "SELECT c.cares_id, c.cares_calculationname, c.cares_timestamp, " +
                    "cs.haschanges, " +
                    "s.polygon, s.ecosystems, s.pressures FROM " +
            "calculationresult c " +
            "JOIN calculationresultslice cs ON c.cares_id = cs.id " +
            "JOIN scenariosnapshot s ON c.scenariosnapshot_id = s.id "+
            "AND s.owner = :username AND c.cares_op = :operation ORDER BY c.cares_timestamp DESC",
    resultSetMapping = "CalculationCmpMapping" )


@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class CalculationResult implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "cares_id", nullable = false)
    private Integer id;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "cares_op")
    private String operationName;

    @Basic
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "cares_op_options", columnDefinition = "json")
    private Map<String, String> operationOptions;

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

    @NotNull
    @Type(value = DoubleArrayType.class,
        parameters = @org.hibernate.annotations.Parameter(
            name = "sql_array_type",
            value = "double precision"
        )
    )
    @Column(name = "cares_impactmatrix", columnDefinition = "double precision[][]")
    private double[][] impactMatrix;

    @Basic()
    @Column(name = "cares_geotiff", columnDefinition = "bytea")
    private byte[] rasterData;

    @Basic(optional = false)
    @NotNull
    @Column(name = "cares_timestamp")
    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp;

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

    @Transient
    private GridCoverage2D coverage;

    @Column(name = "cares_image")
    private byte[] imagePNG;

    public CalculationResult() {}

    public CalculationResult(GridCoverage2D coverage) {
        setCoverage(coverage);
    }

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

    public double[][] getImpactMatrix() {
        return impactMatrix;
    }

    public void setImpactMatrix(double[][] impactMatrix) {
        this.impactMatrix = impactMatrix;
    }

    public void setCoverage(GridCoverage2D coverage) {
        this.coverage = coverage;
    }

    public GridCoverage2D getCoverage() {
        if (coverage != null) return coverage; // transient case
        else {
            if(getRasterData() == null) return null;

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

    public ScenarioSnapshot getScenarioSnapshot() {
        return scenarioSnapshot;
    }

    public void setOperationName(int operation) {
        this.operationName = operationName(operation);
    }

    public String getOperationName() { return operationName; }

    public void setOperationOptions(Map<String, String> opts) {
        this.operationOptions = opts;
    }

    public byte[] getImagePNG() { return imagePNG; }

    public void setImagePNG(byte[] imagePNG) { this.imagePNG = imagePNG; }

    public Map<String, String> getOperationOptions() { return operationOptions; }

    public int getOperation() {
        return operationName.equals("CumulativeImpact") ?
            CalcService.OPERATION_CUMULATIVE :
            CalcService.OPERATION_RARITYADJUSTED;
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
        if (!(object instanceof CalculationResult other)) {
            return false;
        }
        return (this.id != null || other.id == null) && (this.id == null || this.id.equals(other.id));
    }

    @Override
    public String toString() {
        return "se.havochvatten.symphony.entity.CalculationResult [ id=" + id + " ]";
    }
}
