package se.havochvatten.symphony.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.CascadeType;
import org.hibernate.annotations.*;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.operation.union.CascadedPolygonUnion;

import se.havochvatten.symphony.scenario.BandChangeEntity;
import se.havochvatten.symphony.scenario.ScenarioCopyOptions;
import se.havochvatten.symphony.scenario.ScenarioCommon;
import se.havochvatten.symphony.service.ScenarioService;
import se.havochvatten.symphony.service.CalcService;
import se.havochvatten.symphony.dto.NormalizationOptions;
import se.havochvatten.symphony.dto.ScenarioAreaDto;
import se.havochvatten.symphony.dto.ScenarioDto;

import jakarta.persistence.*;
import jakarta.persistence.Entity;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "scenario")
@NamedQuery(name = "Scenario.findAllByOwner",
    query = "SELECT NEW se.havochvatten.symphony.dto.ScenarioDto(s) FROM Scenario s" +
            " WHERE s.owner = :owner ORDER BY s.timestamp DESC")
@NamedQuery(name = "Scenario.getEcosystemsToInclude",
    query = "SELECT ecosystemsToInclude FROM Scenario WHERE id = :scenarioId")
@NamedQuery(name = "Scenario.getPressuresToInclude",
    query = "SELECT pressuresToInclude FROM Scenario WHERE id = :scenarioId")

@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public class Scenario implements Serializable, BandChangeEntity, ScenarioCommon {
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
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "integer[]", name = "ecosystems")
    protected int[] ecosystemsToInclude;

    @Basic
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "integer[]", name = "pressures")
    protected int[] pressuresToInclude;

    @Basic(optional = true)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    protected JsonNode changes;

    @Embedded
    @NotNull
    @AttributeOverride(name = "type", column = @Column(name = "normalization_type", nullable = false))
    @AttributeOverride(name = "userDefinedValue", column = @Column(name = "normalization_userdefinedvalue", nullable = false))
    @AttributeOverride(name = "stdDevMultiplier", column = @Column(name = "normalization_stddevmultiplier", nullable = false))
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
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "operation_options", columnDefinition = "json")
    protected JsonNode operationOptions;

    @OneToMany(mappedBy = "scenario", orphanRemoval = true, fetch = FetchType.EAGER,
        cascade = { CascadeType.MERGE, CascadeType.PERSIST })
    @Fetch(FetchMode.SUBSELECT)
    private List<ScenarioArea> areas = new ArrayList<>();

    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.MERGE)
    @JoinColumn(name = "latestcalculation_cares_id")
    private CalculationResult latestCalculation;

    public Scenario() {}

    public Scenario(ScenarioDto dto, ScenarioService service) {
        id = dto.id;
        owner = dto.owner;
        timestamp = new Date();
        baselineId = dto.baselineId; // look up real baseline object from database?
        name = dto.name;
        changes = dto.changes; // ditto
        normalization = dto.normalization;
        ecosystemsToInclude = dto.ecosystemsToInclude;
        pressuresToInclude = dto.pressuresToInclude;

        for(ScenarioAreaDto a : dto.areas) {
            ScenarioArea area = new ScenarioArea(a, this);
            if(a.getCustomCalcAreaId() != null) {
                service.updateArea(area, a.getCustomCalcAreaId());
            }
            this.areas.add(area);
        }

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
            Arrays.stream(options.areaChangesToInclude).boxed().toList();

        var areasToAdd = altAreas == null ? s.areas : altAreas;

        for(ScenarioArea a : areasToAdd) {
            CalculationArea calcArea = a.getCustomCalcArea();
            this.areas.add(new ScenarioArea(
                new ScenarioAreaDto(
                    -1,
                    changesToInclude.contains(a.getId()) ?
                        a.getChanges() : null,
                    a.getFeatureJson(),
                    a.getMatrix(),
                    null,
                    a.getExcludedCoastal(),
                    calcArea == null ? null : calcArea.getId()), this));
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

    public void setScenarioAreas(List<ScenarioArea> scenarioareas) {
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
        return (new CascadedPolygonUnion(areas.stream().map(ScenarioArea::getGeometry).toList())).union();
    }

    public Map<Integer, Integer> getAreasExcludingCoastal() {
        return areas.stream().filter(a -> a.getExcludedCoastal() != null)
                .collect(Collectors.toMap(ScenarioArea::getId, ScenarioArea::getExcludedCoastal));
    }
}
