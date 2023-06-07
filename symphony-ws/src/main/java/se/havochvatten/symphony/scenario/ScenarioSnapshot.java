package se.havochvatten.symphony.scenario;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.geotools.data.geojson.GeoJSONReader;
import org.geotools.data.geojson.GeoJSONWriter;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;
import org.locationtech.jts.geom.Geometry;
import se.havochvatten.symphony.dto.NormalizationOptions;
import se.havochvatten.symphony.entity.CalculationResult;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.PastOrPresent;
import javax.validation.constraints.Size;
import java.util.Date;

@Entity
public class ScenarioSnapshot {

    private static final ObjectMapper mapper = new ObjectMapper();

    @Basic(optional = false)
    @NotNull
    @GeneratedValue
    @Id
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
    @Type(type = "json")
    @Column(columnDefinition = "json")
    protected JsonNode polygon;

    @OneToOne(fetch = FetchType.EAGER)
    protected CalculationResult latestCalculation;

    public JsonNode getPolygon() {
        return polygon;
    }

    public void setPolygon(JsonNode polygon) {
        this.polygon = polygon;
    }

    public NormalizationOptions getNormalization() { return normalization; }

    public JsonNode getChanges() { return changes; }

    public void setChanges(JsonNode changes) { this.changes = changes; }

    public Geometry getGeometry() {
        return GeoJSONReader.parseGeometry(this.polygon.toString());
    }

    public int[] getEcosystemsToInclude() {
        return ecosystemsToInclude;
    }

    public int[] getPressuresToInclude() {
        return pressuresToInclude;
    }

    public void setEcosystemsToInclude(int[] ecosystems) {
        this.ecosystemsToInclude = ecosystems;
    }


    public ScenarioSnapshot() {}

    public static ScenarioSnapshot makeSnapshot(Scenario s, Geometry polygon) throws JsonProcessingException {
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
        snapshot.latestCalculation = s.getLatestCalculation();

        return snapshot;
    }
}
