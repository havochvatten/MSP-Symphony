package se.havochvatten.symphony.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vladmihalcea.hibernate.type.array.IntArrayType;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import org.hibernate.annotations.*;

import javax.persistence.*;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.Map;

@Entity
@TypeDefs({
    @TypeDef(name = "int-array", typeClass = IntArrayType.class),
    @TypeDef(name = "json", typeClass = JsonBinaryType.class)
})
@Table(name = "compoundcomparison", schema = "symphony")
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
    private String cmpName;

    @NotNull
    @Column(name = "cmp_calculations", nullable = false)
    @Type(type = "int-array")
    private int[] cmpCalculations;

    @NotNull
    @Column(name = "cmp_result", nullable = false)
    @Type(type = "json")
    private Map<Integer, double[][]> cmpResult = new java.util.HashMap<>();

    @Size(max = 255)
    @NotNull
    @Column(name = "cmp_owner", nullable = false)
    private String cmpOwner;

    public CompoundComparison(BaselineVersion baseline, String cmpName, String cmpOwner, int[] calcResults) {
        this.baseline = baseline;
        this.cmpName = cmpName;
        this.cmpOwner = cmpOwner;
        this.cmpCalculations = calcResults;
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

    public String getCmpName() {
        return cmpName;
    }

    public void setCmpName(String cmpName) {
        this.cmpName = cmpName;
    }

    public int[] getCmpCalculations() {
        return cmpCalculations;
    }

    public void setCmpCalculations(int[] cmpCalculations) {
        this.cmpCalculations = cmpCalculations;
    }

    public @NotNull Map<Integer, double[][]> getCmpResult() {
        return cmpResult;
    }

    public void setCmpResultForCalculation(int calculationId, double[][] result) {
        cmpResult.put(calculationId, result);
    }

    public String getCmpOwner() {
        return cmpOwner;
    }

    public void setCmpOwner(String cmpOwner) {
        this.cmpOwner = cmpOwner;
    }
}
