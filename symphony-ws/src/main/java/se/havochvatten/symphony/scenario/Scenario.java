package se.havochvatten.symphony.scenario;

import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vladmihalcea.hibernate.type.array.IntArrayType;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import org.geotools.data.geojson.GeoJSONReader;
import org.hibernate.annotations.*;
import org.locationtech.jts.geom.Geometry;
import org.opengis.feature.simple.SimpleFeature;
import se.havochvatten.symphony.calculation.CalcService;
import se.havochvatten.symphony.dto.MatrixParameters;
import se.havochvatten.symphony.dto.NormalizationOptions;
import se.havochvatten.symphony.dto.ScenarioDto;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.entity.CalculationResult;

import javax.persistence.*;
import javax.persistence.Entity;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.PastOrPresent;
import javax.validation.constraints.Size;
import javax.ws.rs.NotFoundException;
import javax.xml.bind.annotation.XmlTransient;
import java.io.IOException;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "scenario")
@NamedQueries({
        @NamedQuery(name = "Scenario.findAllByOwner",
                query = "SELECT NEW se.havochvatten.symphony.dto.ScenarioDto(s) FROM Scenario s" +
                        " WHERE s.owner = :owner and TYPE(s) <> ScenarioSnapshot ORDER BY s.timestamp DESC")
})
@TypeDefs({
        @TypeDef(name = "json", typeClass = JsonBinaryType.class),
        @TypeDef(name = "int-array", typeClass = IntArrayType.class)
})
@Embeddable
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public class Scenario implements Serializable {
    private static final ObjectMapper mapper = new ObjectMapper();

    @Basic(optional = false)
    @NotNull
    @GeneratedValue
    @Id
    protected Integer id;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 2147483647)
    protected String owner; // immutable

    @Basic(optional = false)
    @NotNull
    @Temporal(TemporalType.TIMESTAMP)
    @PastOrPresent
    @UpdateTimestamp
    protected Date timestamp;

    /////////////// Supplied by frontend

    @Basic(optional = false)
    protected Integer baselineId;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 2147483647)
    protected String name;

    @Basic(optional = false)
    @NotNull
    // Or just use Hibernate Spatiol with PostGIS geometry?
    @Type(type = "json")
    @Column(columnDefinition = "json")
    protected JsonNode feature; // TODO Use custom deserializer to deserialize into SimpleFeature

    @Basic(optional = true)
    @Type(type = "json")
    @Column(columnDefinition = "json")
    protected JsonNode changes;

    @Basic
    @Type(type = "int-array")
    @Column(columnDefinition = "integer[]", name = "ecosystems")
    protected int[] ecosystemsToInclude;

    @Basic
    @Type(type = "int-array")
    @Column(columnDefinition = "integer[]", name = "pressures")
    protected int[] pressuresToInclude;

    @Basic
    @Type(type = "json")
    @Column(columnDefinition = "json")
    protected JsonNode matrix; // Just use JsonNode until we have a better representation to serialize
    // Just put MatrixParameters as type?

    @Embedded
    @NotNull
    protected NormalizationOptions normalization;

    @OneToOne(fetch = FetchType.LAZY)
    protected CalculationResult latestCalculation;

    public Scenario() {}

    public Scenario(ScenarioDto dto, CalcService calcService) {
        id = dto.id;
        owner = dto.owner;
        timestamp = new Date();
        baselineId = dto.baselineId; // look up real baseline object from database?
        name = dto.name;
        feature = dto.feature; // could have a proper Feature object here
        changes = dto.changes; // ditto
        normalization = dto.normalization;
        matrix = mapper.valueToTree(dto.matrix);
        ecosystemsToInclude = dto.ecosystemsToInclude;
        pressuresToInclude = dto.pressuresToInclude;
        if (dto.latestCalculation != null)
            // TODO handle case when old Calculaltions can have been pruned?
            latestCalculation =
                    calcService.getCalculation(dto.latestCalculation).orElseThrow(NotFoundException::new);
    }

    public static Scenario createWithoutId(String name, BaselineVersion baseline,
                                           JsonNode polygon,
                                           MatrixParameters matrix,
                                           NormalizationOptions normalization) throws IOException {
        var s = new Scenario();
        s.name = name;
        s.feature = polygon;
        s.baselineId = baseline.getId();
        s.changes = mapper.readTree("{}");
        s.matrix = mapper.valueToTree(matrix);
        s.normalization = normalization;
        return s;
    }

    public Integer getId() {
        return id;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String username) {owner = username;}

    public Integer getBaselineId() {
        return baselineId;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

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

    /** Convenience function to retrieve scenario geometry */
    public Geometry getGeometry() {
        return (Geometry) getFeature().getDefaultGeometry();
    }

    public JsonNode getChanges() {
        return changes;
    }

    public void setChanges(JsonNode changes) {
        this.changes = changes;
    }

    public CalculationResult getLatestCalculation() {
        return latestCalculation;
    }

    public void setLatestCalculation(CalculationResult calculation) {
        this.latestCalculation = calculation;
    }

    public NormalizationOptions getNormalization() { return normalization; }

    public void setNormalization(NormalizationOptions opts) {
        this.normalization = opts;
    }

    public int[] getEcosystemsToInclude() {
        return ecosystemsToInclude;
    }

    public int[] getPressuresToInclude() {
        return pressuresToInclude;
    }

    public JsonNode getMatrix() {
        return matrix;
    }

    public MatrixParameters getMatrixParameters() {
        try {
            return mapper.treeToValue(matrix, MatrixParameters.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    public void setMatrix(JsonNode matrix) {
        this.matrix = matrix;
    }

    public void setEcosystemsToInclude(int[] ecosystemsToInclude) {
        this.ecosystemsToInclude = ecosystemsToInclude;
    }

    public void setPressuresToInclude(int[] pressuresToInclude) {
        this.pressuresToInclude = pressuresToInclude;
    }
}
