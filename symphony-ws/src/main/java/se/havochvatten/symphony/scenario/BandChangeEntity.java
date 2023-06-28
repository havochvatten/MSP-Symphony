package se.havochvatten.symphony.scenario;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.Map;

public interface BandChangeEntity {
   JsonNode getChanges();
   void setChanges(JsonNode changes);
   Map<String, BandChange> getChangeMap();
}
