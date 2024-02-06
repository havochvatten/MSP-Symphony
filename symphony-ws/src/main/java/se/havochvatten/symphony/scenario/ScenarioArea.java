package se.havochvatten.symphony.scenario;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.geotools.data.geojson.GeoJSONReader;
import org.hibernate.annotations.*;
import org.hibernate.annotations.CascadeType;
import org.locationtech.jts.geom.Geometry;
import org.opengis.feature.simple.SimpleFeature;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.dto.MatrixParameters;
import se.havochvatten.symphony.dto.ScenarioAreaDto;
import se.havochvatten.symphony.entity.CalculationArea;

import javax.persistence.*;
import javax.persistence.Entity;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Stream;

@Entity
@Table(name = "scenarioarea")
@NamedQueries({
    @NamedQuery(name = "ScenarioArea.findMany",
        query = "SELECT s FROM ScenarioArea s WHERE id IN :ids"),
})
public class ScenarioArea implements BandChangeEntity {
    private static final ObjectMapper mapper = new ObjectMapper();

    private static JsonNode defaultMatrixJSON() {
        try {
            return mapper.readTree("{\"matrixType\":\"STANDARD\"}");
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Id
    @Generated(GenerationTime.INSERT)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Basic(optional = true)
    @Type(type = "json")
    @Column(columnDefinition = "json")
    protected JsonNode changes;

    @Basic(optional = false)
    @NotNull
    @Type(type = "json")
    @Column(columnDefinition = "json")
    protected JsonNode feature;

    @Basic
    @Type(type = "json")
    @Column(columnDefinition = "json")
    protected JsonNode matrix;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @Cascade(CascadeType.SAVE_UPDATE)
    @JoinColumn(name = "scenario", nullable = false)
    private Scenario scenario;

    @Basic
    @Column(name = "excluded_coastal")
    private Integer excludedCoastal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custom_calcarea")
    private CalculationArea customCalcArea = null;

    public ScenarioArea() {

    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public JsonNode getChanges() {
        return changes;
    }

    public BandChange[] getAllChangesByType(LayerType layerType) {
        return getAllChangesByType(this.scenario, layerType);
    }
    
    public BandChange[] getAllChangesByType(BandChangeEntity altScenario, LayerType layerType) {
        BandChangeEntity bcEntity = altScenario == null ? scenario : altScenario;

        Map<Integer, BandChange> baseChangeMap =
            bcEntity.getChangeMap().getOrDefault(layerType, new HashMap<>()),
            changeMap = getChangeMap().getOrDefault(layerType, new HashMap<>());

        return Stream.concat(
                baseChangeMap.entrySet().stream().filter(c -> !changeMap.containsKey(c.getKey())),
                changeMap.entrySet().stream()).map(entry -> {
                    BandChange bc = entry.getValue();
                    bc.band = entry.getKey();
                    return bc;}).toArray(BandChange[]::new);
    }

    public Map<LayerType, Map<Integer, BandChange>> getCombinedChangeMap() {
        Map<LayerType, Map<Integer, BandChange>> changeMap = new HashMap<>();
        changeMap.putAll((mapper.convertValue(scenario.getChanges(), new TypeReference<>() {})));
        changeMap.putAll(getChangeMap());
        return changeMap;
    }

    public void setChanges(JsonNode changes) {
        this.changes = changes;
    }

    public ObjectMapper getMapper() { return mapper; }

    public SimpleFeature getFeature() {
        try {
            return GeoJSONReader.parseFeature(mapper.writeValueAsString(feature));
        } catch (IOException e) {
            throw new RuntimeException("Unable to parse feature: "+feature.toString());
        }
    }

    public JsonNode getFeatureJson() {
        return feature;
    }

    public void setFeature(JsonNode feature) {
        this.feature = feature;
    }

    public Geometry getGeometry() {
        return (Geometry) getFeature().getDefaultGeometry();
    }

    public JsonNode getMatrix() {
        return matrix;
    }

    public Integer getExcludedCoastal() {
        return excludedCoastal;
    }

    public MatrixParameters getMatrixParameters() {
        try {
            if(matrix == null || matrix.isNull()) {
                this.matrix = defaultMatrixJSON();
            }
            return mapper.treeToValue(matrix, MatrixParameters.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    public void setMatrix(JsonNode matrix) {
        this.matrix = matrix;
    }

    public Scenario getScenario() {
        return scenario;
    }

    public void setScenario(Scenario scenario) {
        this.scenario = scenario;
    }

    public CalculationArea getCustomCalcArea() {
        return customCalcArea;
    }

    public void setCustomCalcArea(CalculationArea customCalcArea) {
        this.customCalcArea = customCalcArea;
    }

    public ScenarioArea(ScenarioAreaDto dto, Scenario scenario) {
        int tmpId = dto.getId();
        if(tmpId != -1) {
            this.id = tmpId;
        }

        feature = dto.getFeature();
        changes = dto.getChanges();
        matrix = mapper.valueToTree(dto.getMatrix());
        this.scenario = scenario;
        excludedCoastal = dto.getExcludedCoastal();
    }

    public String getName() {
        Object nameValue = getFeature().getProperty("name").getValue();
        return nameValue == null ? this.scenario.getName() + ": (area)" : nameValue.toString();
    }
}
