package se.havochvatten.symphony.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vladmihalcea.hibernate.type.array.DoubleArrayType;
import com.vladmihalcea.hibernate.type.array.IntArrayType;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import org.geotools.data.geojson.GeoJSONReader;
import org.geotools.data.geojson.GeoJSONWriter;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.hibernate.annotations.TypeDefs;
import org.hibernate.annotations.UpdateTimestamp;
import org.locationtech.jts.geom.Geometry;
import se.havochvatten.symphony.dto.MatrixResponse;
import se.havochvatten.symphony.dto.NormalizationOptions;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.scenario.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.PastOrPresent;
import javax.validation.constraints.Size;
import java.util.*;

@Entity
@Table(name = "scenariosnapshot")
@TypeDefs({
        @TypeDef(name = "json", typeClass = JsonBinaryType.class),
        @TypeDef(name = "int-array", typeClass = IntArrayType.class),
        @TypeDef(name = "double-array", typeClass = DoubleArrayType.class)
})
public class ScenarioSnapshot implements BandChangeEntity, ScenarioCommon {

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
    @NotNull
    @Type(type = "int-array")
    @Column(columnDefinition = "integer[]", name = "ecosystems")
    protected int[] ecosystemsToInclude;

    @Basic
    @NotNull
    @Type(type = "int-array")
    @Column(columnDefinition = "integer[]", name = "pressures")
    protected int[] pressuresToInclude;

    /**
     * JSON object serializing the ScenarioChanges record class.
     */
    @Basic(optional = true)
    @Type(type = "json")
    @Column(columnDefinition = "json")
    protected JsonNode changes;

    @Basic
    @Type(type = "json")
    @NotNull
    @Column(columnDefinition = "json")
    protected JsonNode areas;

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
    @Type(type = "json")
    @Column(columnDefinition = "json")
    protected JsonNode polygon;

    @Column(name = "normalization_value")
    @Type(type = "double-array")
    private double[] normalizationValue;

    @NotNull
    @Column(name = "area_matrix_map", nullable = false)
    @Type(type = "int-array")
    private int[][] areaMatrixMap;

    @OneToOne(mappedBy = "scenarioSnapshot")
    private CalculationResult calculationresults;

    public CalculationResult getCalculationresults() {
        return calculationresults;
    }

    public void setCalculationresults(CalculationResult calculationresults) {
        this.calculationresults = calculationresults;
    }

    public JsonNode getPolygon() {
        return polygon;
    }

    public void setPolygon(JsonNode polygon) {
        this.polygon = polygon;
    }

    public NormalizationOptions getNormalization() { return normalization; }

    public ObjectMapper getMapper() { return mapper; }

    /* The entity freezes the changes for multiple entities, both Scenario and ScenarioArea.
    *  JSON object structure serializes the ScenarioChanges record class, exposing two keys:
    *  "baseChanges" and "areaChanges". The latter is a map of area id to changes for that area.
    *
    *  Recalculation method needs to provide both scenario-wide changes and for individual areas,
    *  and achieves this by implementing the BandChangeEntity interface -
    *  but note that getChanges differs slightly from both the other implementing classes
    *  (Scenario and ScenarioArea). This is why the implementation of getChanges doesn't provide
    *  the backing field, as might be expected. */

    /**
     * @return Scenario-wide changes map <br>
     * NOTE - not the actual `changes` field but a subset, satisfying its usage
     * in the recalculation procedure. <br>
     * Use getChangesForReport() to access the field.
    */
    public JsonNode getChanges() { return changes.get("baseChanges"); }

    /**
     * @return The actual `changes` field of the entity
     */
    public JsonNode getChangesForReport() { return changes; }

    public void setChanges(JsonNode changes) { this.changes = changes; }

    public Geometry getGeometry() {
        return GeoJSONReader.parseGeometry(this.polygon.toString());
    }

    public Map<Integer, ScenarioAreaRecord> getAreas() {
        return mapper.convertValue(areas, new TypeReference<>() {});
    }

    public Integer getBaselineId() { return baselineId; }

    public int[] getEcosystemsToInclude() {
        return ecosystemsToInclude;
    }

    public int[] getPressuresToInclude() {
        return pressuresToInclude;
    }

    public void setEcosystemsToInclude(int[] ecosystems) {
        this.ecosystemsToInclude = ecosystems;
    }

    public Map<Integer, Integer> getAreaMatrixMap() {
        Map<Integer, Integer> map = new HashMap<>();

        for (int[] ints : areaMatrixMap) {
            map.put(ints[0], ints[1]);
        }

        return map;
    }

    public void setAreaMatrixMap(Map<Integer, Integer> areaMatrixMap) {
        int[][] map = new int[areaMatrixMap.size()][2];
        int i = 0;
        for (Integer key : areaMatrixMap.keySet()) {
            map[i][0] = key;
            map[i][1] = areaMatrixMap.get(key);
            i++;
        }
        this.areaMatrixMap = map;
    }

    public double[] getNormalizationValue() {
        return normalizationValue;
    }

    public void setNormalizationValue(double[] normalizationValue) {
        this.normalizationValue = normalizationValue;
    }

    public MatrixResponse getMatrixResponse() {
        return new MatrixResponse(getAreaMatrixMap(), getNormalizationValue());
    }

    public void setAreas(List<ScenarioArea> areas) {
        var areaMap = new HashMap<Integer, ScenarioAreaRecord>() {};
        for (var area : areas) {
            areaMap.put(area.getId(),
                new ScenarioAreaRecord( area.getName(),
                                        area.getFeatureJson(),
                                        area.getExcludedCoastal()));
        }
        this.areas = mapper.valueToTree(areaMap);
    }

    public Map<LayerType, Map<Integer, BandChange>> getChangeMap() {
        ScenarioChanges sc = mapper.convertValue(changes, new TypeReference<>() {});
        return sc.baseChanges();
    }

    public List<ScenarioArea> getTmpAreas () {
        List<ScenarioArea> areas = new ArrayList<>();


        for (var areaEntry : getAreas().entrySet()) {
            Integer areaId = areaEntry.getKey();

            ScenarioArea tmpArea = new ScenarioArea();
            tmpArea.setId(areaId);
            tmpArea.setFeature(areaEntry.getValue().featureJson());
            tmpArea.setChanges(changes.get("areaChanges").get(areaId.toString()));
            areas.add(tmpArea);
        }
        return areas;
    }

    public Map<Integer, Integer> getAreasExcludingCoastal() {
        Map<Integer, Integer> areas = new HashMap<>();
        for (var area : getAreas().entrySet()) {
            if (area.getValue().getExcludedCoastal() != -1) {
                areas.put(area.getKey(), area.getValue().excludedCoastal());
            }
        }
        return areas;
    }

    public ScenarioSnapshot() {}

    public static ScenarioSnapshot makeSnapshot(Scenario s,
                                                Geometry polygon,
                                                Map<Integer, Integer> matrixMap,
                                                double[] normalizationValue) throws JsonProcessingException {
        var snapshot = new ScenarioSnapshot();

        snapshot.id = null;
        snapshot.owner = s.owner;
        snapshot.timestamp = s.timestamp;
        snapshot.baselineId = s.baselineId;
        snapshot.name = s.name;
        snapshot.polygon = mapper.readTree(GeoJSONWriter.toGeoJSON(polygon));
        snapshot.changes = s.changes;
        snapshot.ecosystemsToInclude = s.ecosystemsToInclude;
        snapshot.pressuresToInclude = s.pressuresToInclude;
        snapshot.normalization = s.normalization;
        snapshot.normalizationValue = normalizationValue;
        snapshot.setAreaMatrixMap(matrixMap);
        snapshot.setAreas(s.getAreas());

        return snapshot;
    }
}
