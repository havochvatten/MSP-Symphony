package se.havochvatten.symphony.dto;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import se.havochvatten.symphony.entity.ReliabilityPartition;

import java.util.Set;

public class ReliabilityMapping {
    private static final ObjectMapper mapper = new ObjectMapper();
    private ClassificationPartition[] partitions;

    public ReliabilityMapping() {}

    public ReliabilityMapping(Set<ReliabilityPartition> reliabilitymap) {
        partitions = new ClassificationPartition[reliabilitymap.size()];
        int i = 0;
        for (ReliabilityPartition extent : reliabilitymap) {
            try {
                partitions[i++] = new ClassificationPartition(extent.getValue(), extent.getPolygon());
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
        }
    }

    public static class ClassificationPartition {
        private int value;
        private JsonNode polygon;

        public ClassificationPartition() {}

        public ClassificationPartition(int value, String polygon) throws JsonProcessingException {
            this.value = value;
            this.polygon = mapper.readTree(polygon);
        }

        public int getValue() {
            return value;
        }

        public void setValue(int value) {
            this.value = value;
        }

        public JsonNode getPolygon() {
            return polygon;
        }

        public void setPolygon(JsonNode polygon) {
            this.polygon = polygon;
        }
    }

    public ClassificationPartition[] getPartitions() {
        return partitions;
    }
}
