package se.havochvatten.symphony.scenario;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vladmihalcea.hibernate.type.array.IntArrayType;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import org.hibernate.annotations.*;
import org.hibernate.annotations.CascadeType;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.operation.union.CascadedPolygonUnion;

import se.havochvatten.symphony.calculation.CalcService;
import se.havochvatten.symphony.dto.NormalizationOptions;
import se.havochvatten.symphony.dto.ScenarioAreaDto;
import se.havochvatten.symphony.dto.ScenarioDto;
import se.havochvatten.symphony.entity.CalculationResult;

import javax.persistence.*;
import javax.persistence.Entity;
import javax.persistence.NamedNativeQueries;
import javax.persistence.NamedNativeQuery;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.PastOrPresent;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "scenario")
@NamedQueries({
    @NamedQuery(name = "Scenario.findAllByOwner",
            query = "SELECT NEW se.havochvatten.symphony.dto.ScenarioDto(s) FROM Scenario s" +
                    " WHERE s.owner = :owner ORDER BY s.timestamp DESC"),
    @NamedQuery(name = "Scenario.getEcosystemsToInclude",
            query = "SELECT ecosystemsToInclude FROM Scenario WHERE id = :scenarioId"),
    @NamedQuery(name = "Scenario.getPressuresToInclude",
            query = "SELECT pressuresToInclude FROM Scenario WHERE id = :scenarioId")
})
@TypeDefs({
        @TypeDef(name = "json", typeClass = JsonBinaryType.class),
        @TypeDef(name = "int-array", typeClass = IntArrayType.class)
})
@Embeddable
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public class Scenario implements Serializable, BandChangeEntity {
    private static final ObjectMapper mapper = new ObjectMapper();

    @Id
    @Basic(optional = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    protected Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "name", nullable = false)
    protected String name;

    @NotNull
    @Column(name = "baselineid", nullable = false)
    protected Integer baselineId;

    @Basic
    @Type(type = "int-array")
    @Column(columnDefinition = "integer[]", name = "ecosystems")
    protected int[] ecosystemsToInclude;

    @Basic
    @Type(type = "int-array")
    @Column(columnDefinition = "integer[]", name = "pressures")
    protected int[] pressuresToInclude;

    @Basic(optional = true)
    @Type(type = "json")
    @Column(columnDefinition = "json")
    protected JsonNode changes;

    @Embedded
    @NotNull
    @AttributeOverrides({
        @AttributeOverride(name = "type", column = @Column(name = "normalization_type", nullable = false)),
        @AttributeOverride(name = "userDefinedValue", column = @Column(name = "normalization_userdefinedvalue", nullable = false)),
        @AttributeOverride(name = "stdDevMultiplier", column = @Column(name = "normalization_stddevmultiplier", nullable = false))
    })
    protected NormalizationOptions normalization;

    @Size(max = 255)
    @NotNull
    @Column(name = "owner", nullable = false)
    protected String owner;

    @Basic(optional = false)
    @NotNull
    @Temporal(TemporalType.TIMESTAMP)
    @PastOrPresent
    @UpdateTimestamp
    protected Date timestamp;

    @Basic(optional = false)
    @NotNull
    @Column(name = "operation", nullable = false, columnDefinition = "int2 default 0")
    protected int operation = CalcService.OPERATION_CUMULATIVE;

    @Basic(optional = true)
    @Type(type = "json")
    @Column(name = "operation_options", columnDefinition = "json")
    protected JsonNode operationOptions;

    @OneToMany(mappedBy = "scenario", orphanRemoval = true, fetch = FetchType.EAGER)
    @Cascade({ CascadeType.MERGE, CascadeType.PERSIST })
    @Fetch(FetchMode.SUBSELECT)
    private List<ScenarioArea> areas = new ArrayList<>();

    @OneToOne(fetch = FetchType.EAGER)
    @Cascade({ CascadeType.MERGE, CascadeType.REMOVE })
    @JoinColumn(name = "latestcalculation_cares_id")
    private CalculationResult latestCalculation;

    public Scenario() {}

    public Scenario(ScenarioDto dto) {
        id = dto.id;
        owner = dto.owner;
        timestamp = new Date();
        baselineId = dto.baselineId; // look up real baseline object from database?
        name = dto.name;
        changes = dto.changes; // ditto
        normalization = dto.normalization;
        ecosystemsToInclude = dto.ecosystemsToInclude;
        pressuresToInclude = dto.pressuresToInclude;
        areas.addAll(Arrays.stream(dto.areas).map(a -> new ScenarioArea(a, this)).toList());
        operation = dto.operation;
    }

    public Scenario(Scenario s, ScenarioCopyOptions options, List<ScenarioArea> altAreas) {
        id = null;
        owner = s.getOwner();
        timestamp = new Date();
        baselineId = s.baselineId;
        name = options.name;
        changes = options.includeScenarioChanges ? s.changes : null;
        normalization = s.normalization;
        ecosystemsToInclude = s.ecosystemsToInclude;
        pressuresToInclude = s.pressuresToInclude;
        operation = s.operation;

        List<Integer> changesToInclude =
            Arrays.stream(options.areaChangesToInclude).boxed().collect(Collectors.toList());

        var areasToAdd = altAreas == null ? s.areas : altAreas;

        for(ScenarioArea a : areasToAdd) {
            this.areas.add(new ScenarioArea(
                new ScenarioAreaDto(
                    -1,
                    changesToInclude.contains(a.getId()) ?
                        a.getChanges() : null,
                    a.getFeatureJson(),
                    a.getMatrix(),
                    null,
                    a.getExcludedCoastal()), this));
        }
    }

    public ObjectMapper getMapper() { return mapper; }

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

    public Integer getBaselineId() {
        return baselineId;
    }

    public void setBaselineId(Integer baselineid) {
        this.baselineId = baselineid;
    }

    public int[] getEcosystemsToInclude() {
        return ecosystemsToInclude;
    }

    public void setEcosystemsToInclude(int[] ecosystems) {
        this.ecosystemsToInclude = ecosystems;
    }

    public int[] getPressuresToInclude() {
        return pressuresToInclude;
    }

    public void setPressures(int[] pressures) {
        this.pressuresToInclude = pressures;
    }

    public JsonNode getChanges() {
        return changes == null || changes.isNull() ? mapper.createObjectNode() : changes;
    }

    public void setChanges(JsonNode changes) {
        this.changes = changes;
    }

    public NormalizationOptions getNormalization() { return normalization; }

    public void setNormalization(NormalizationOptions opts) { this.normalization = opts; }

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

    public Integer getOperation() { return operation; }

    public Map<String, String> getOperationOptions() {
        return mapper.convertValue(operationOptions, Map.class);
    }

    public List<ScenarioArea> getAreas() {
        return areas;
    }

    protected void setScenarioAreas(List<ScenarioArea> scenarioareas) {
        this.areas.clear();
        this.areas.addAll(scenarioareas);
    }

    public CalculationResult getLatestCalculation() {
        return latestCalculation;
    }

    public void setLatestCalculation(CalculationResult calculation) {
        this.latestCalculation = calculation;
    }

    public Geometry getGeometry() {
        return (new CascadedPolygonUnion(areas.stream().map(a -> a.getGeometry()).collect(Collectors.toList()))).union();
    }

    public Map<Integer, Integer> getAreasExcludingCoastal() {
        return areas.stream().filter(a -> a.getExcludedCoastal() != null)
                .collect(Collectors.toMap(a -> a.getId(), a -> a.getExcludedCoastal()));
    }
}
