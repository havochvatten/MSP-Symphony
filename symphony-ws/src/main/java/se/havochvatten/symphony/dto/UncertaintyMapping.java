package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import se.havochvatten.symphony.entity.UncertaintyPartition;

import java.util.Set;

public class UncertaintyMapping {
    private static final ObjectMapper mapper = new ObjectMapper();

    public UncertaintyMapping(Set<UncertaintyPartition> uncertaintymap) {
        partitions = new ClassificationPartition[uncertaintymap.size()];
        int i = 0;
        for (UncertaintyPartition extent : uncertaintymap) {
            try {
                partitions[i++] = new ClassificationPartition(extent.getValue(), extent.getPolygon());
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
        }
    }

    public static class ClassificationPartition {
        public int value;
        public JsonNode polygon;

        public ClassificationPartition(int value, String polygon) throws JsonProcessingException {
            this.value = value;
            this.polygon = mapper.readTree(polygon);
        }
    }

    public ClassificationPartition[] partitions;
}
