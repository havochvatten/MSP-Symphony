package se.havochvatten.symphony.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.ejb.EJB;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.dto.Operation;
import se.havochvatten.symphony.dto.SummaryModelConfig;
import se.havochvatten.symphony.dto.SummaryModelConfig.ModelSummary;
import se.havochvatten.symphony.dto.SummaryModelConfig.StepFormula;
import se.havochvatten.symphony.dto.SummaryModelConfig.SummaryModelDescription;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Singleton
@Startup
public class SummaryModelConfigService {

    private static final Logger logger = Logger.getLogger(SummaryModelConfigService.class.getName());
    private static final List<String> CATEGORIES = List.of("ecosystem", "pressure");

    @EJB
    MetaDataService metaDataService;

    @EJB
    PropertiesService props;

    private Path summaryModelBaseDir;
    private final ObjectMapper mapper = new ObjectMapper();

    // Key format: "baselineName:category:modelKey" (all lowercase)
    private final Map<String, SummaryModelConfig> configs = new ConcurrentHashMap<>();

    @PostConstruct
    void init() {
        try {
            summaryModelBaseDir = Path.of(props.getProperty("data.summary_models_dir"));
            if (!Files.isDirectory(summaryModelBaseDir)) {
                logger.warning("Summary models directory not found or not a directory: " + summaryModelBaseDir
                    + " — starting with no summary models loaded.");
                return;
            }
            loadAllBaselines();
            List<String> loadedBaselines = getAvailableBaselines();
            if (loadedBaselines.isEmpty()) {
                logger.warning("No summary model configs loaded from " + summaryModelBaseDir
                    + ". Expected layout: <dir>/<baselineName>/<ecosystem|pressure>/<model>.json");
            } else {
                logger.info("Summary models loaded for baselines: " + loadedBaselines);
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Failed to load summary model configs", e);
        }
    }

    private void loadAllBaselines() throws IOException {
        try (Stream<Path> children = Files.list(summaryModelBaseDir)) {
            children.filter(Files::isDirectory)
                .forEach(this::loadBaseline);
        }
    }

    private void loadBaseline(Path baselineDir) {
        String baselineName = baselineDir.getFileName().toString().toLowerCase();
        for (String category : CATEGORIES) {
            Path categoryDir = baselineDir.resolve(category);
            if (!Files.isDirectory(categoryDir)) {
                logger.fine("No " + category + " directory for baseline: " + baselineName);
                continue;
            }
            try (Stream<Path> files = Files.list(categoryDir)) {
                files.filter(p -> p.getFileName().toString().endsWith(".json"))
                    .sorted()
                    .forEach(jsonFile -> loadConfig(baselineName, category, jsonFile));
            } catch (IOException e) {
                logger.log(Level.WARNING, "Failed to scan category dir: " + categoryDir, e);
            }
        }
    }

    private void loadConfig(String baselineName, String category, Path jsonFile) {
        String fileName = jsonFile.getFileName().toString();
        String modelKey = fileName.substring(0, fileName.length() - 5).toLowerCase(); // strip .json
        String configKey = baselineName + ":" + category + ":" + modelKey;

        try (InputStream in = Files.newInputStream(jsonFile)) {
            SummaryModelConfig config = mapper.readValue(in, SummaryModelConfig.class);
            validate(config, configKey);
            configs.put(configKey, config);
            logger.fine("Loaded summary model config: " + configKey);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Failed to load summary model config: " + jsonFile, e);
        }
    }

    /**
     * Validates the structural integrity of a summary-model config so authoring mistakes surface
     * at deployment time rather than as opaque runtime errors during heatmap generation.
     *
     * <p>Checks: non-empty steps; non-blank unique step names; each step has at least one of
     * {@code bands}/{@code inputs}; every {@code inputs} reference resolves to an earlier-order
     * step (which also rules out cycles); the configured {@code outputStep}, if set, matches a
     * step name.</p>
     *
     * @throws IllegalArgumentException if the config violates any structural rule
     */
    private void validate(SummaryModelConfig config, String configKey) {
        if (config.getSteps() == null || config.getSteps().isEmpty()) {
            throw new IllegalArgumentException("Config has no steps: " + configKey);
        }

        Map<String, Integer> stepOrders = new HashMap<>();
        for (SummaryModelConfig.Step step : config.getSteps()) {
            String name = step.getName();
            if (name == null || name.isBlank()) {
                throw new IllegalArgumentException("Step has null/blank name in " + configKey);
            }
            if (stepOrders.containsKey(name)) {
                throw new IllegalArgumentException("Duplicate step name '" + name + "' in " + configKey);
            }
            boolean hasBands = step.getBands() != null && !step.getBands().isEmpty();
            boolean hasInputs = step.getInputs() != null && !step.getInputs().isEmpty();
            if (!hasBands && !hasInputs) {
                throw new IllegalArgumentException("Step '" + name + "' has neither bands nor inputs in " + configKey);
            }
            stepOrders.put(name, step.getOrder());
        }

        for (SummaryModelConfig.Step step : config.getSteps()) {
            if (step.getInputs() == null) continue;
            for (String inputName : step.getInputs()) {
                Integer inputOrder = stepOrders.get(inputName);
                if (inputOrder == null) {
                    throw new IllegalArgumentException("Step '" + step.getName() + "' references unknown input '"
                        + inputName + "' in " + configKey);
                }
                if (inputOrder >= step.getOrder()) {
                    throw new IllegalArgumentException("Step '" + step.getName() + "' (order " + step.getOrder()
                        + ") references input '" + inputName + "' with order " + inputOrder
                        + "; inputs must have strictly lower order in " + configKey);
                }
            }
        }

        String outputStep = config.getOutputStep();
        if (outputStep != null && !outputStep.isBlank() && !stepOrders.containsKey(outputStep)) {
            throw new IllegalArgumentException("outputStep '" + outputStep + "' does not match any step in " + configKey);
        }
    }

    public SummaryModelConfig getConfig(String baselineName, LayerType type, String modelKey) {
        String key = baselineName.toLowerCase() + ":" + type.name().toLowerCase() + ":" + modelKey.toLowerCase();
        SummaryModelConfig config = configs.get(key);
        if (config == null) {
            throw new IllegalArgumentException("No summary model config found for key: " + key);
        }
        return config;
    }

    public List<String> getAvailableModels(String baselineName, LayerType type) {
        String prefix = baselineName.toLowerCase() + ":" + type.name().toLowerCase() + ":";
        return configs.keySet().stream()
            .filter(key -> key.startsWith(prefix))
            .map(key -> key.substring(prefix.length()))
            .sorted()
            .collect(Collectors.toList());
    }

    /** Available models with their picker label resolved to the request locale (falls back to the model key). */
    public List<ModelSummary> getAvailableModelSummaries(String baselineName, LayerType type, String locale) {
        return getAvailableModels(baselineName, type).stream()
            .map(key -> {
                SummaryModelConfig config = getConfig(baselineName, type, key);
                return new ModelSummary(key, resolveLabel(config.getName(), locale, key));
            })
            .collect(Collectors.toList());
    }

    /** Returns all baseline names that have at least one loaded config. */
    public List<String> getAvailableBaselines() {
        return configs.keySet().stream()
            .map(key -> key.split(":")[0])
            .distinct()
            .sorted()
            .collect(Collectors.toList());
    }

    /**     
     * Resolves a label map to a single string for some locale. 
     * Falling back to the English entry if it exists, next the first available entry and
     * lastly the key itself only if no labels are defined.
     */
    private static String resolveLabel(Map<String, String> labels, String locale, String fallback) {
        if (labels == null || labels.isEmpty()) {
            return fallback;
        }

        if (labels.containsKey(locale)) {
            return labels.get(locale);
        }

        String firstKey = labels.keySet().stream().findFirst().get();
        return labels.containsKey("en") ? labels.get("en") : labels.get(firstKey);
    }

    public SummaryModelDescription getModelDescription(
        String baselineName, LayerType type, String modelKey, int bverId, String locale) {

        SummaryModelConfig config = getConfig(baselineName, type, modelKey);

        String title = resolveLabel(config.getTitle(), locale,
            type.name().toLowerCase() + ":" + modelKey);

        List<StepFormula> formulas = new ArrayList<>();
        Map<String, String> inputReference = new HashMap<>();

        List<SummaryModelConfig.Step> sortedSteps = config.getSteps().stream()
            .sorted(Comparator.comparingInt(SummaryModelConfig.Step::getOrder))
            .toList();

        for (SummaryModelConfig.Step step : sortedSteps) {
            StepFormula sf = new StepFormula();

            if (step.getBands() != null && !step.getBands().isEmpty()) {
                List<SummaryModelConfig.FormulaInput> formulaInputs = step.getBands().stream()
                    .map(bandNumber -> metaDataService.getBandTitle(bverId, type.name(), bandNumber, locale))
                    .map(String::trim)
                    .map(bandTitle -> {
                        SummaryModelConfig.FormulaInput formulaInput = new SummaryModelConfig.FormulaInput();
                        formulaInput.setDisplayName(bandTitle);
                        return formulaInput;
                    })
                    .collect(Collectors.toList());
                sf.setFormulaInputs(formulaInputs);
            } else if (step.getInputs() != null && !step.getInputs().isEmpty()) {
                sf.setHasStepsAsInput(true);
                List<SummaryModelConfig.FormulaInput> formulaInputs = step.getInputs().stream()
                    .map(inputName -> {
                        SummaryModelConfig.FormulaInput formulaInput = new SummaryModelConfig.FormulaInput();
                        formulaInput.setName(inputName);
                        formulaInput.setDisplayName(inputReference.get(inputName));
                        return formulaInput;
                    })
                    .toList();
                sf.setFormulaInputs(formulaInputs);
            }

            String norm = "";
            if (step.getNormalization() != null && "linear".equalsIgnoreCase(step.getNormalization().getType())) {
                norm = String.format("%.0f-%.0f",
                    step.getNormalization().getMin(),
                    step.getNormalization().getMax());
            }

            if (step.getName().equals(config.getOutputStep())) {
                sf.setOutput(true);
            }

            Operation operation = step.getOperation() != null ? step.getOperation() : Operation.MEAN;
            String resolvedLabel = resolveLabel(step.getLabel(), locale, step.getName());
            sf.setName(step.getName());
            sf.setLabel(resolvedLabel);
            sf.setOperation(operation.name().toLowerCase());
            sf.setNormalization(norm);
            formulas.add(sf);

            inputReference.put(step.getName(), resolvedLabel);
        }

        SummaryModelDescription desc = new SummaryModelDescription();
        desc.setModelKey(modelKey);
        desc.setTitle(title);
        desc.setSteps(formulas);
        return desc;
    }
}
