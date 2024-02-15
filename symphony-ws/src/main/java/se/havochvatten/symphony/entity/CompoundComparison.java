package se.havochvatten.symphony.entity;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vladmihalcea.hibernate.type.array.IntArrayType;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import org.hibernate.annotations.*;
import se.havochvatten.symphony.calculation.ComparisonResult;
import se.havochvatten.symphony.dto.CompoundComparisonSlice;

import javax.persistence.*;
import javax.persistence.Entity;
import javax.persistence.NamedNativeQuery;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.Date;
import java.util.Map;

@Entity
@TypeDefs({
    @TypeDef(name = "int-array", typeClass = IntArrayType.class),
    @TypeDef(name = "json", typeClass = JsonBinaryType.class)
})
@Table(name = "compoundcomparison", schema = "symphony")
//@NamedQuery(name = "CompoundComparison.findByOwner",
//    query = "SELECT c FROM CompoundComparison c WHERE c.cmpOwner = :username")

@SqlResultSetMapping(
    name = "CompoundCmpSliceMapping",
    classes = @ConstructorResult(
        targetClass = CompoundComparisonSlice.class,
        columns = {
            @ColumnResult(name="id", type=Integer.class),
            @ColumnResult(name="cmp_name", type=String.class),
            @ColumnResult(name="calculationNames", type=String[].class),
            @ColumnResult(name="cmp_timestamp", type=Date.class)
        }
    )
)

@NamedNativeQuery(name = "CompoundComparison.findByOwner",
    query = "SELECT c.id, c.cmp_name, c.cmp_timestamp, " +
                "array_agg(value->>'calculationName') calculationNames " +
                "FROM compoundcomparison c, json_each(c.cmp_result) " +
                "WHERE c.cmp_owner = :username " +
                "GROUP BY c.id, c.cmp_name, c.cmp_timestamp " +
                "ORDER BY c.id DESC",
    resultSetMapping = "CompoundCmpSliceMapping" )
public class CompoundComparison {

    private static final ObjectMapper mapper = new ObjectMapper();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "baseline_id", nullable = false)
    private BaselineVersion baseline;

    @Size(max = 255)
    @NotNull
    @Column(name = "cmp_name", nullable = false)
    private String name;

    @NotNull
    @Column(name = "cmp_calculations", nullable = false)
    @Type(type = "int-array")
    private int[] calculations;

    @NotNull
    @Column(name = "cmp_result", nullable = false)
    @Type(type = "json")
    private Map<Integer, ComparisonResult> result = new java.util.HashMap<>();

    @Size(max = 255)
    @NotNull
    @Column(name = "cmp_owner", nullable = false)
    private String owner;

    @NotNull
    @Column(name = "cmp_timestamp", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp;

    public CompoundComparison() {}

    public CompoundComparison(BaselineVersion baseline, String name, String owner, int[] calcResults, Date timestamp) {
        this.baseline = baseline;
        this.name = name;
        this.owner = owner;
        this.calculations = calcResults;
        this.timestamp = timestamp;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public BaselineVersion getBaseline() {
        return baseline;
    }

    public void setBaseline(BaselineVersion baseline) {
        this.baseline = baseline;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int[] getCalculations() {
        return calculations;
    }

    public void setCalculations(int[] calculations) {
        this.calculations = calculations;
    }

    public @NotNull Map<Integer, ComparisonResult> getResult() {
        return result;
    }

    public void setCmpResultForCalculation(int calculationId, int[] ecosystems, int[] pressures, double[][] result, String calculationName) {
        ComparisonResult comparisonResult = new ComparisonResult(ecosystems, pressures, result, calculationName);
        this.result.put(calculationId, comparisonResult);
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }
}
