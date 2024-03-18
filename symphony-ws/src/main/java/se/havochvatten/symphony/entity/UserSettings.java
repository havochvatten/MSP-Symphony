package se.havochvatten.symphony.entity;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.hibernate.annotations.Type;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
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
    @Type(type = "json")
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
