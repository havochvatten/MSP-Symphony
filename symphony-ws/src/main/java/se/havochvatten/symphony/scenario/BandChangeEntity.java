package se.havochvatten.symphony.scenario;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

public interface BandChangeEntity {
    ObjectMapper getMapper();
    JsonNode getChanges();
    void setChanges(JsonNode changes);

    default Map<String, BandChange> getChangeMap() {
        Map<String, BandChange> changeMap =
            getChanges() == null || getChanges().isNull() ? new HashMap<>() :
                getMapper().convertValue(getChanges(), new TypeReference<>() {});
        return changeMap;
    }
}
