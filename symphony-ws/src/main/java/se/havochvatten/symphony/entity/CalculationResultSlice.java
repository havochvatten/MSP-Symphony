package se.havochvatten.symphony.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.hibernate.annotations.Immutable;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import java.util.Date;

/**
 * View mapping
**/

 // Create statement (pgSQL): -- Keep this comment until integration with Liquibase
 //                              (or other schema change management tool)
 // CREATE VIEW symphony.calculationresultslice AS
 // SELECT cr.cares_id AS id,
 //    cr.cares_bver_id AS baselineversion_id,
 //    cr.cares_calculationname AS calculationname,
 //    cr.cares_timestamp AS "timestamp",
 //    cr.cares_owner AS owner,
 //    cr.cares_geotiff IS NULL AS ispurged,
 //    (((s.changes ->> 'baseChanges'::text)::json) ->> 'PRESSURE'::text) IS NOT NULL
 //          OR (((s.changes ->> 'baseChanges'::text)::json) ->> 'ECOSYSTEM'::text) IS NOT NULL
 //          OR (( SELECT count(ac.key) AS count
 //             FROM json_each((s.changes ->> 'areaChanges'::text)::json) ac(key, value)
 //             WHERE NOT ac.value::text = '{}'::text)) > 0 AS haschanges
 //   FROM symphony.scenariosnapshot s
 //     JOIN symphony.calculationresult cr ON cr.scenariosnapshot_id = s.id;
 //

@Entity
@Immutable
@NamedQuery(name = "CalculationResultSlice.findAllByOwner",
    query = "SELECT c FROM CalculationResultSlice c WHERE c.owner = :owner " +
            "ORDER BY c.timestamp DESC")
@Table(name = "calculationresultslice", schema = "symphony")
public class CalculationResultSlice {
    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "baselineversion_id")
    private Integer baselineversionId;

    @Size(max = 255)
    @Column(name = "calculationname")
    private String name;

    @Column(name = "\"timestamp\"")
    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp;

    @Size(max = 255)
    @Column(name = "owner")
    private String owner;

    @Column(name = "ispurged")
    private Boolean isPurged;

    @Column(name = "haschanges")
    private Boolean hasChanges;

    public Integer getId() {
        return id;
    }

    @JsonIgnore
    public Integer getBaselineversionId() {
        return baselineversionId;
    }

    public String getName() {
        return name;
    }

    public long getTimestamp() {
        return timestamp.getTime();
    }

    public String getOwner() {
        return owner;
    }

    public Boolean getIsPurged() {
        return isPurged;
    }

    @JsonProperty("hasChanges")
    public Boolean hasChanges() {
        return hasChanges;
    }

    protected CalculationResultSlice() {
    }
}
