package se.havochvatten.symphony.service;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.dto.SummaryModelConfig.SummaryModelDescription;
import se.havochvatten.symphony.dto.SummaryModelConfig.StepFormula;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class SummaryModelConfigServiceTest {

    SummaryModelConfigService service;
    Path tmpDir;

    // Minimal valid step JSON (single MEAN step over band 0)
    static final String SIMPLE_JSON = """
        {
          "title": { "en": "Test title", "sv": "Testtitel", "fr": "Titre test" },
          "name": { "en": "Simple model", "sv": "Enkel modell", "fr": "Modèle simple" },
          "outputStep": "total",
          "steps": [
            {
              "name": "total",
              "operation": "MEAN",
              "order": 10,
              "bands": [0]
            }
          ]
        }
        """;

    // Two-step pipeline: A (bands) then B (inputs=[A])
    static final String TWO_STEP_JSON = """
        {
          "title": { "en": "Two title", "sv": "Två titel", "fr": "Deux titre" },
          "outputStep": "B",
          "steps": [
            {
              "name": "A",
              "label": { "en": "Step A", "sv": "Steg A", "fr": "Étape A" },
              "operation": "MEAN",
              "order": 10,
              "bands": [0]
            },
            {
              "name": "B",
              "label": { "en": "Step B", "sv": "Steg B", "fr": "Étape B" },
              "operation": "MEAN",
              "order": 20,
              "inputs": ["A"]
            }
          ]
        }
        """;

    @Before
    public void setUp() throws Exception {
        tmpDir = Files.createTempDirectory("smctest");
        service = new SummaryModelConfigService();
        service.props = mock(PropertiesService.class);
        service.metaDataService = mock(MetaDataService.class);
        when(service.props.getProperty("data.summary_models_dir")).thenReturn(tmpDir.toString());
    }

    @After
    public void tearDown() throws IOException {
        deleteRecursively(tmpDir);
    }

    // ── loading ──────────────────────────────────────────────────────────────

    @Test
    public void loadsConfigsFromValidDirectoryTree() throws Exception {
        writeJson("bl1", "ecosystem", "simple", SIMPLE_JSON);
        writeJson("bl1", "ecosystem", "balanced", SIMPLE_JSON);
        writeJson("bl1", "pressure", "simple", SIMPLE_JSON);
        writeJson("bl2", "ecosystem", "simple", SIMPLE_JSON);

        service.init();

        assertThat(service.getAvailableModels("bl1", LayerType.ECOSYSTEM), containsInAnyOrder("simple", "balanced"));
        assertThat(service.getAvailableModels("bl1", LayerType.PRESSURE), contains("simple"));
        assertThat(service.getAvailableModels("bl2", LayerType.ECOSYSTEM), contains("simple"));
        assertThat(service.getAvailableBaselines(), containsInAnyOrder("bl1", "bl2"));
    }

    @Test
    public void skipsNonDirectoryEntriesAtBaselineRoot() throws Exception {
        writeJson("bl1", "ecosystem", "simple", SIMPLE_JSON);
        Files.writeString(tmpDir.resolve("stray.txt"), "noise"); // not a directory
        service.init();

        assertThat(service.getAvailableModels("bl1", LayerType.ECOSYSTEM), contains("simple"));
        assertThat(service.getAvailableBaselines(), contains("bl1"));
    }

    @Test
    public void skipsMissingCategoryDirectory() throws Exception {
        writeJson("bl1", "ecosystem", "simple", SIMPLE_JSON); // only ecosystem, no pressure dir

        service.init();

        assertThat(service.getAvailableModels("bl1", LayerType.ECOSYSTEM), contains("simple"));
        assertThat(service.getAvailableModels("bl1", LayerType.PRESSURE), is(empty()));
    }

    @Test
    public void getConfigWithUnknownKey_throws() throws Exception {
        writeJson("bl1", "ecosystem", "simple", SIMPLE_JSON);
        service.init();

        assertThrows(IllegalArgumentException.class,
            () -> service.getConfig("bl1", LayerType.ECOSYSTEM, "nonexistent"));
    }

    @Test
    public void keysAreCaseInsensitive() throws Exception {
        writeJson("BASELINE2019", "ecosystem", "Simple", SIMPLE_JSON);
        service.init();

        // Should work with mixed-case input
        assertNotNull(service.getConfig("Baseline2019", LayerType.ECOSYSTEM, "simple"));
        assertNotNull(service.getConfig("baseline2019", LayerType.ECOSYSTEM, "Simple"));
    }

    @Test
    public void initWithMissingBaseDirectory_loadsNothingAndDoesNotThrow() {
        when(service.props.getProperty("data.summary_models_dir"))
            .thenReturn("/nonexistent/path/that/does/not/exist");

        service.init(); // must not throw

        assertThat(service.getAvailableBaselines(), is(empty()));
        assertThat(service.getAvailableModels("anybaseline", LayerType.ECOSYSTEM), is(empty()));
    }

    @Test
    public void initResilientToSingleBadJsonFile() throws Exception {
        writeJson("bl1", "ecosystem", "good", SIMPLE_JSON);
        writeJson("bl1", "ecosystem", "bad", "{ this is not valid json }}");

        service.init(); // must not throw

        List<String> models = service.getAvailableModels("bl1", LayerType.ECOSYSTEM);
        assertThat(models, contains("good"));
        assertThat(models, not(hasItem("bad")));
    }

    // ── validate: structural errors silently skip config ────────────────────

    @Test
    public void validate_emptySteps_configNotRegistered() throws Exception {
        writeJson("bl1", "ecosystem", "broken", """
            {"outputStep": "x", "steps": []}
            """);
        service.init();

        assertThat(service.getAvailableModels("bl1", LayerType.ECOSYSTEM), is(empty()));
    }

    @Test
    public void validate_blankStepName_configNotRegistered() throws Exception {
        writeJson("bl1", "ecosystem", "broken", """
            {"steps": [{"name": "  ", "order": 10, "operation": "MEAN", "bands": [0]}]}
            """);
        service.init();

        assertThat(service.getAvailableModels("bl1", LayerType.ECOSYSTEM), is(empty()));
    }

    @Test
    public void validate_duplicateStepName_configNotRegistered() throws Exception {
        writeJson("bl1", "ecosystem", "broken", """
            {"steps": [
              {"name": "dup", "order": 10, "operation": "MEAN", "bands": [0]},
              {"name": "dup", "order": 20, "operation": "MEAN", "bands": [1]}
            ]}
            """);
        service.init();

        assertThat(service.getAvailableModels("bl1", LayerType.ECOSYSTEM), is(empty()));
    }

    @Test
    public void validate_stepWithNeitherBandsNorInputs_configNotRegistered() throws Exception {
        writeJson("bl1", "ecosystem", "broken", """
            {"steps": [{"name": "A", "order": 10, "operation": "MEAN"}]}
            """);
        service.init();

        assertThat(service.getAvailableModels("bl1", LayerType.ECOSYSTEM), is(empty()));
    }

    @Test
    public void validate_stepReferencesUnknownInput_configNotRegistered() throws Exception {
        writeJson("bl1", "ecosystem", "broken", """
            {"steps": [
              {"name": "A", "order": 10, "operation": "MEAN", "bands": [0]},
              {"name": "B", "order": 20, "operation": "MEAN", "inputs": ["ghost"]}
            ]}
            """);
        service.init();

        assertThat(service.getAvailableModels("bl1", LayerType.ECOSYSTEM), is(empty()));
    }

    @Test
    public void validate_stepReferencesInputWithHigherOrder_configNotRegistered() throws Exception {
        // B (order 10) references A (order 20) — forward reference
        writeJson("bl1", "ecosystem", "broken", """
            {"steps": [
              {"name": "A", "order": 20, "operation": "MEAN", "bands": [0]},
              {"name": "B", "order": 10, "operation": "MEAN", "inputs": ["A"]}
            ]}
            """);
        service.init();

        assertThat(service.getAvailableModels("bl1", LayerType.ECOSYSTEM), is(empty()));
    }

    @Test
    public void validate_outputStepNotMatchingAnyStep_configNotRegistered() throws Exception {
        writeJson("bl1", "ecosystem", "broken", """
            {"outputStep": "nonexistent", "steps": [
              {"name": "A", "order": 10, "operation": "MEAN", "bands": [0]}
            ]}
            """);
        service.init();

        assertThat(service.getAvailableModels("bl1", LayerType.ECOSYSTEM), is(empty()));
    }

    // ── getAvailableModelSummaries ───────────────────────────────────────────

    @Test
    public void getAvailableModelSummaries_resolvesNameByLocale_fallsBackToKey() throws Exception {
        writeJson("bl1", "ecosystem", "simple", SIMPLE_JSON);   // has a name map
        writeJson("bl1", "ecosystem", "nameless", """
            { "outputStep": "s", "steps": [{"name":"s","order":10,"operation":"MEAN","bands":[0]}] }
            """);                                                  // no name map
        service.init();

        var summaries = service.getAvailableModelSummaries("bl1", LayerType.ECOSYSTEM, "sv");

        var byKey = summaries.stream()
            .collect(java.util.stream.Collectors.toMap(s -> s.getKey(), s -> s.getName()));
        assertThat(byKey.get("simple"), is("Enkel modell"));
        assertThat(byKey.get("nameless"), is("nameless")); // fallback to key
    }

    // ── getModelDescription ──────────────────────────────────────────────────

    @Test
    public void getModelDescription_bandsOnlyStep_populatesDisplayNamesFromBandTitle() throws Exception {
        writeJson("bl1", "ecosystem", "simple", SIMPLE_JSON);
        service.init();

        when(service.metaDataService.getBandTitle(eq(1), eq("ECOSYSTEM"), eq(0), eq("en")))
            .thenReturn("Seagrass");

        SummaryModelDescription desc = service.getModelDescription("bl1", LayerType.ECOSYSTEM, "simple", 1, "en");

        assertThat(desc.getModelKey(), is("simple"));
        assertThat(desc.getTitle(), is("Test title"));
        assertThat(desc.getSteps(), hasSize(1));

        StepFormula sf = desc.getSteps().get(0);
        assertFalse(sf.isHasStepsAsInput());
        assertThat(sf.getFormulaInputs(), hasSize(1));
        assertThat(sf.getFormulaInputs().get(0).getDisplayName(), is("Seagrass"));
    }

    @Test
    public void getModelDescription_inputsOnlyStep_hasStepsAsInputTrue() throws Exception {
        writeJson("bl1", "ecosystem", "twostep", TWO_STEP_JSON);
        service.init();

        when(service.metaDataService.getBandTitle(anyInt(), anyString(), anyInt(), anyString()))
            .thenReturn("SomeBand");

        SummaryModelDescription desc = service.getModelDescription("bl1", LayerType.ECOSYSTEM, "twostep", 1, "sv");

        // Step B is the inputs-only step (locale "sv" resolves stepB's label to "Steg B")
        StepFormula stepB = desc.getSteps().stream()
            .filter(sf -> "Steg B".equals(sf.getLabel()))
            .findFirst().orElseThrow();

        assertTrue(stepB.isHasStepsAsInput());
        assertThat(stepB.getFormulaInputs(), hasSize(1));
        assertThat(stepB.getFormulaInputs().get(0).getName(), is("A"));
        assertThat(stepB.getFormulaInputs().get(0).getDisplayName(), is("Steg A")); // from stepA's resolved sv label
    }

    @Test
    public void getModelDescription_outputStepFlag() throws Exception {
        writeJson("bl1", "ecosystem", "simple", SIMPLE_JSON);
        service.init();

        when(service.metaDataService.getBandTitle(anyInt(), anyString(), anyInt(), anyString()))
            .thenReturn("Band");

        SummaryModelDescription desc = service.getModelDescription("bl1", LayerType.ECOSYSTEM, "simple", 1, "en");

        // The one step named "total" is the outputStep
        StepFormula sf = desc.getSteps().get(0);
        assertTrue("outputStep should have isOutput=true", sf.isOutput());
    }

    @Test
    public void getModelDescription_normalizationRendering_linearProducesString() throws Exception {
        String json = """
            {
              "title": { "en": "t", "sv": "t", "fr": "t" },
              "outputStep": "s",
              "steps": [{
                "name": "s",
                "order": 10,
                "operation": "MEAN",
                "bands": [0],
                "normalization": {"type": "linear", "min": 0, "max": 100}
              }]
            }
            """;
        writeJson("bl1", "ecosystem", "norm", json);
        service.init();

        when(service.metaDataService.getBandTitle(anyInt(), anyString(), anyInt(), anyString()))
            .thenReturn("B");

        SummaryModelDescription desc = service.getModelDescription("bl1", LayerType.ECOSYSTEM, "norm", 1, "en");
        assertThat(desc.getSteps().get(0).getNormalization(), is("0-100"));
    }

    @Test
    public void getModelDescription_noNormalization_emptyString() throws Exception {
        writeJson("bl1", "ecosystem", "simple", SIMPLE_JSON); // simple.json has no normalization on the step
        service.init();

        when(service.metaDataService.getBandTitle(anyInt(), anyString(), anyInt(), anyString()))
            .thenReturn("B");

        SummaryModelDescription desc = service.getModelDescription("bl1", LayerType.ECOSYSTEM, "simple", 1, "en");
        assertThat(desc.getSteps().get(0).getNormalization(), is(""));
    }

    @Test
    public void getModelDescription_nullTitle_fallsBackToTypeAndModelKey() throws Exception {
        String json = """
            {
              "outputStep": "s",
              "steps": [{"name": "s", "order": 10, "operation": "MEAN", "bands": [0]}]
            }
            """;
        writeJson("bl1", "ecosystem", "notitle", json);
        service.init();

        when(service.metaDataService.getBandTitle(anyInt(), anyString(), anyInt(), anyString()))
            .thenReturn("B");

        SummaryModelDescription desc = service.getModelDescription("bl1", LayerType.ECOSYSTEM, "notitle", 1, "en");
        assertThat(desc.getTitle(), is("ecosystem:notitle"));
    }

    // ── helpers ─────────────────────────────────────────────────────────────

    private void writeJson(String baseline, String category, String modelKey, String json) throws IOException {
        Path dir = tmpDir.resolve(baseline).resolve(category);
        Files.createDirectories(dir);
        Files.writeString(dir.resolve(modelKey + ".json"), json);
    }

    private static void deleteRecursively(Path path) throws IOException {
        if (!Files.exists(path)) return;
        Files.walkFileTree(path, new SimpleFileVisitor<>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                Files.delete(file);
                return FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                Files.delete(dir);
                return FileVisitResult.CONTINUE;
            }
        });
    }
}
