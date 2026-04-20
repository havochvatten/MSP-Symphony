package se.havochvatten.symphony.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.ejb.Stateless;
import se.havochvatten.symphony.dto.HeatmapModelConfig;
import se.havochvatten.symphony.dto.LayerType;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Stateless
public class HeatmapConfigService {

    private final ObjectMapper mapper = new ObjectMapper();
    private final Map<String, HeatmapModelConfig> configs = new HashMap<>();

    @PostConstruct
    void init() {
        load("ecosystem:simple", "heatmaps/EcosystemSimpleModelConfig.json");
        load("ecosystem:balanced", "heatmaps/EcosystemBalancedModelConfig.json");
        load("pressure:simple", "heatmaps/PressureSimpleModelConfig.json");
        load("pressure:balanced", "heatmaps/PressureBalancedModelConfig.json");
    }

    private void load(String key, String resourcePath) {
        try (InputStream in = Thread.currentThread()
                .getContextClassLoader()
                .getResourceAsStream(resourcePath)) {

            if (in == null) {
                throw new IllegalStateException("Missing heatmap config resource: " + resourcePath);
            }

            HeatmapModelConfig config = mapper.readValue(in, HeatmapModelConfig.class);
            configs.put(key, config);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load heatmap config: " + resourcePath, e);
        }
    }

    public HeatmapModelConfig getConfig(LayerType type, String model) {
        String key = type.name().toLowerCase() + ":" + model.toLowerCase();
        HeatmapModelConfig config = configs.get(key);
        if (config == null) {
            throw new IllegalArgumentException("No heatmap config found for key: " + key);
        }
        return config;
    }
}
