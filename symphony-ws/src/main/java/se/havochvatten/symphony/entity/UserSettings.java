package se.havochvatten.symphony.entity;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.hibernate.annotations.JdbcTypeCode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Entity
@Table(name = "usersettings", schema = "symphony")
public class UserSettings {
    private static final ObjectMapper mapper = new ObjectMapper();

    @Id
    @Size(max = 255)
    @Column(name = "\"user\"", nullable = false)
    private String user;

    @NotNull
    @Column(name = "settings", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode settings;

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public JsonNode getSettings() {
        return settings;
    }

    public void setSettings(Map<String, Object> settings) {
        this.settings = mapper.valueToTree(settings);
    }

    public void updateSettings(Map<String, Object> settings) throws JsonMappingException {
        if(this.settings == null) {
            this.setSettings(settings);
        } else {
            this.settings = mapper.updateValue(this.settings, settings);
        }
    }
}
