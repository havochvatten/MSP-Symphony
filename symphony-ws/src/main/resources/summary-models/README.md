# Summary model config guide

This guide explains how to create and maintain summary model config files from scratch.

---

## Deployed directory layout

The runtime (`SummaryModelConfigService`) reads configs from the directory
configured by `data.summary_models_dir` (default `/app/data/symphony/summary-models`).
Configs must be organised per baseline:

```
<data.summary_models_dir>/
  <baselineName>/
    ecosystem/
      simple.json
      balanced.json
    pressure/
      simple.json
      balanced.json
  <anotherBaselineName>/
    ecosystem/
      ...
```

`<baselineName>` must match `BaselineVersion.name` (case-insensitive). A
baseline with no directory, or a directory that exists but contains no JSON
files for a given category, will cause the overview accordion to be hidden
for that category in the UI.

The example files in this repository (`/ecosystem/*.json`, `/pressure/*.json`)
are **flat templates** — they have no baseline directory level.  Copy them
under the appropriate baseline subdirectory when deploying.

The runtime logic for loading and executing these configs is implemented in
`SummaryModelConfigService` and `DataLayerService`.

---

## 1. What a summary model config does

A summary model config defines a **step pipeline** that transforms one source raster (multiple bands) into one output heatmap (single band):

1. Read source bands from ecosystem/pressure coverage
2. Compute one or more named steps using `MEAN`, `MAX`, or `SUM`
3. Optionally normalize step outputs (typically linear `0..100`)
4. Select one step as final output (`outputStep`)

---

## 2. Root-level schema

```json
{
  "titleTranslationKey": "map.summary-model.myModelTitle",
  "outputStep": "some_step_name",
  "steps": [
    { "name": "...", "operation": "...", "order": 10, "bands": [0, 1] }
  ]
}
```

### `titleTranslationKey` (string, optional)
- Translation key for the model title shown in the UI dialog header.
- If omitted, the frontend falls back to a default label derived from the model key.

### `outputStep` (string, recommended)
- Name of the step that becomes the returned heatmap.
- Must match one step `name`.
- If omitted/blank, runtime falls back to the last step by `order`.
- Always set explicitly for clarity — relying on the fallback makes the config harder to read and fragile to reordering.

### `steps` (array, required)
- Ordered logically by each step's `order` integer.
- Runtime sorts by `order` before execution.
- Each step must have a unique `name`.

---

## 3. Step schema

Each step object supports:

```json
{
  "name": "step_name",
  "translationKey": "map.summary-model.step.birdTotal",
  "operation": "MEAN",
  "order": 10,
  "bands": [0, 1, 2],
  "inputs": ["other_step"],
  "normalization": {
    "type": "linear",
    "min": 0,
    "max": 100,
    "robustBounds": {
      "robustBoundsEnabled": true,
      "lowPercentile": 2.0,
      "highPercentile": 98.0,
      "maxSamples": 200000
    }
  }
}
```

### `name` (string, required)
- Identifier for the step.
- Referenced by other steps through `inputs`.
- Must be unique within the file.

### `translationKey` (string, optional)
- Translation key for the step name in the UI.
- If omitted, the step `name` is used as-is in the UI.

### `operation` (string, optional but recommended)
- Supported values: `MEAN`, `MAX`, `SUM`.
- Case-insensitive at runtime — uppercase is the convention in config files.
- If omitted/null, defaults to `MEAN`.

### `order` (integer, required)
- Execution priority (ascending).
- Use gaps (`10, 20, 30`) so future steps can be inserted without renumbering.
- Every step's inputs must be produced by steps with a lower `order` value.

### `bands` (array of integers, optional)
- Band indexes from source raster coverage.
- Zero-based indexes.
- Can be combined with `inputs` in the same step — both sources are aggregated together using the same operation.

### `inputs` (array of strings, optional)
- Names of previously computed steps to use as inputs.
- Runtime throws an error if a referenced name is missing or not yet computed.
- At least one of `bands` or `inputs` must be present.

### `normalization` (object, optional)
- Applied **to this step output only**.
- For current models, final normalization belongs on the `outputStep` itself.
- Intermediate steps that feed into a merge should also be normalized if scale alignment matters before the merge.

---

## 4. Operation semantics

For every pixel:

### `MEAN`
- Sums all finite source values.
- Divides by number of finite contributors.
- If no finite contributors, result is `NaN`.

### `MAX`
- Chooses largest finite contributor.
- If no finite contributors, result is `NaN`.

### `SUM`
- Adds all finite contributors.
- If no finite contributors, result is `NaN`.

Notes:
- Non-finite values (`NaN`, ±`Infinity`) are ignored during aggregation.
- Final output raster writes non-finite values as `0.0`.

---

## 5. Normalization schema and behavior

### Linear normalization

```json
  "normalization": {
    "type": "linear",
    "min": 0,
    "max": 100
  }
```

Behavior:
- Computes observed source bounds from finite step values.
- Linearly maps source range to target range `[min..max]`.
- If config bounds are invalid, or observed range is too narrow, normalization is skipped.

### Robust bounds (optional)

```json
"normalization": {
  "type": "linear",
  "min": 0,
  "max": 100,
  "robustBounds": {
    "robustBoundsEnabled": true,
    "lowPercentile": 1.0,
    "highPercentile": 99.0,
    "maxSamples": 200000
  }
}
```

Without robust bounds, linear normalization stretches the full observed value range — from the single lowest pixel to the single highest — to fill the target range. 
This means a handful of extreme outlier pixels can dominate the stretch, compressing the vast majority of meaningful values into a narrow band of the output range and producing a flat, low-contrast heatmap.

Robust bounds address this by using percentile-based source bounds instead of raw min/max. 
For example, with `lowPercentile: 1.0` and `highPercentile: 99.0`, the stretch is based on the 1st and 99th percentile values. 
Pixels outside that range are still mapped, but they saturate at the edges rather than pulling the scale. The result is a normalization that reflects the distribution of typical values rather than the extremes.

**When to use robust bounds:**
- The source data contains extreme outliers — for example, a few very high-pressure or very high-density pixels that are not representative of the broader pattern.
- The output heatmap looks washed out or nearly uniform despite the underlying data having meaningful variation.
- You are normalizing a step that aggregates many bands, where outlier accumulation is more likely.

**When to skip them:**
- The data range is meaningful end-to-end and you want the full extent preserved — for example, when the max value represents a real physical ceiling that should map to 100.
- The dataset is small or sparse enough that percentile estimation is unreliable.

**`maxSamples`** controls how many pixels are sampled when estimating percentiles. Lower values are faster but less accurate; `200000` is a reasonable default for large rasters. 
If the number of finite pixels is below 100, robust bounds are skipped and the runtime falls back to regular min/max automatically.

If `robustBounds` is omitted, behavior is equivalent to disabled.

---

## 6. Simple model template (one-step)

Use this when a model is just one aggregate over many bands.

```json
{
  "titleTranslationKey": "map.summary-model.myTitle",
  "outputStep": "total",
  "steps": [
    {
      "name": "total",
      "translationKey": "map.summary-model.step.total",
      "operation": "MEAN",
      "order": 10,
      "bands": [0, 1, 2],
      "normalization": {
        "type": "linear",
        "min": 0,
        "max": 100
      }
    }
  ]
}
```

Matches pattern used by:
- `/ecosystem/simple.json`
- `/pressure/simple.json`

---

## 7. Balanced/hierarchical template (multi-step)

Use this when themes/sub-groups are computed first, then merged.

```json
{
  "titleTranslationKey": "map.summary-model.myTitle",
  "outputStep": "total",
  "steps": [
    { "name": "group_a", "operation": "MEAN", "order": 10, "bands": [0, 1, 2] },
    { "name": "group_b", "operation": "MAX",  "order": 20, "bands": [3, 4] },
    {
      "name": "total",
      "translationKey": "map.summary-model.step.total",
      "operation": "MEAN",
      "order": 30,
      "inputs": ["group_a", "group_b"],
      "normalization": { "type": "linear", "min": 0, "max": 100 }
    }
  ]
}
```

Matches pattern used by:
- `/ecosystem/balanced.json`
- `/pressure/balanced.json`

---

## 8. Current models — structure and band inclusions

This section documents the four models shipped today. It records which source
bands each model uses, which it deliberately excludes, and why. Band numbers
and names below come from the `meta_bands` / `meta_values` seed in
`database/scripts/2__Install_baseline_2019.sql`.

### 8.1 `ecosystem/simple.json` — "Gröna Kartan 3.0"

**Structure.** Single `MEAN` step over 29 ecosystem bands, normalized 0-100.
Corresponds to "Gröna Kartan 3.0" in `bilaga-2-grona-kartan.pdf` (medelvärde
av alla ekosystemkomponenter), with the abiotic substrate exclusions noted
below.

**Included bands (29):**

| #  | Name                   | #  | Name                       |
|----|------------------------|----|----------------------------|
| 0  | Angiosperms (seagrass) | 15 | Plankton pelagic community |
| 1  | Artificial reef        | 16 | Porpoise Baltic Sea        |
| 2  | Coastal bird           | 17 | Porpoise Belt Sea          |
| 3  | Cod                    | 18 | Porpoise North Sea         |
| 4  | Deep reef              | 19 | Ringed seal                |
| 5  | Eel migration          | 20 | Rivermouth fish            |
| 6  | Fish spawning          | 21 | Rough bottom aphotic       |
| 7  | Grey seal              | 22 | Rough bottom deep          |
| 8  | Haploops reef          | 23 | Rough bottom photic        |
| 9  | Harbour seal           | 24 | Seabird coastal wintering  |
| 10 | Hard bottom aphotic    | 25 | Seabird offshore wintering |
| 11 | Hard bottom deep       | 26 | Shoreline                  |
| 12 | Hard bottom photic     | 30 | Sprat                      |
| 13 | Herring                | 34 | Vendace                    |
| 14 | Mussel reef            |    |                            |

**Excluded bands and reasoning:**

| #  | Name                     | Reason                                                                                                                                                                                                                                                                                                                                            |
|----|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 27 | Soft bottom aphotic      | Substrate fraction layer. In every cell with data, all substrate fractions sum to 1, so including these would inflate "ecosystem value" purely with bottom-type information. Hard bottom and rough bottom are kept because they correlate with reef and structurally complex habitat; soft and transport bottom are kept out as low-value filler. |
| 28 | Soft bottom deep         | Same as 27.                                                                                                                                                                                                                                                                                                                                       |
| 29 | Soft bottom photic       | Same as 27.                                                                                                                                                                                                                                                                                                                                       |
| 31 | Transport bottom aphotic | Same as 27.                                                                                                                                                                                                                                                                                                                                       |
| 32 | Transport bottom deep    | Same as 27.                                                                                                                                                                                                                                                                                                                                       |
| 33 | Transport bottom photic  | Same as 27.                                                                                                                                                                                                                                                                                                                                       |

Note: this exclusion is a deviation from the literal PDF text, which says
"medelvärde av alla ekosystemkomponenter". If a future stakeholder wants a
strictly literal "Gröna Kartan 3.0", add bands 27-29 and 31-33 to the
`bands` array.

### 8.2 `ecosystem/balanced.json` — "Gröna Kartan 3.1"

**Structure.** Four top-level themes (birds, mammals, fish, benthic), each
internally aggregated, then merged via `MEAN` into `ecosystem_total`
normalized 0-100. Mirrors the "Gröna Kartan 3.1" pipeline in the PDF.

| Theme               | Step graph                                                                             |
|---------------------|----------------------------------------------------------------------------------------|
| Birds               | `bird_total = MEAN([2, 24, 25])` → 0-100                                               |
| Mammals (Seals)     | `seal_total = MEAN([7, 9, 19])` → 0-100                                                |
| Mammals (Porpoises) | `porpoise_total = MAX([16, 17, 18])` → 0-100                                           |
| Mammals (combined)  | `mammal_total = MEAN(seal_total, porpoise_total)` → 0-100                              |
| Fish                | `fish_occurrence = MEAN([3, 13, 30, 34])` → 0-100                                      |
| Fish                | `fish_functions = MAX([6, 5, 20])` → 0-100                                             |
| Fish (combined)     | `fish_total = MEAN(fish_occurrence, fish_functions)` → 0-100                           |
| Benthic             | `reef_hardbottom_presence = MAX([1, 14, 8, 4])` (raw)                                  |
| Benthic             | `hardbottom_abiotic = MAX([10, 11, 12])` (raw)                                         |
| Benthic             | `reef_environment_presence = MEAN(reef_hardbottom_presence, hardbottom_abiotic)` (raw) |
| Benthic             | `extra_valuable_reef = MAX([14, 8, 4])` (raw)                                          |
| Benthic             | `reef_total = MEAN(reef_environment_presence, extra_valuable_reef)` → 0-100            |
| Benthic             | `angiosperm_shoreline = MAX([0, 26])` (raw)                                            |
| Benthic (combined)  | `benthic_total = MEAN(reef_total, angiosperm_shoreline)` → 25-100                      |
| Final output        | `ecosystem_total = MEAN(bird_total, mammal_total, fish_total, benthic_total)` → 0-100  |

**Bands referenced (25):** 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
16, 17, 18, 19, 20, 24, 25, 26, 30, 34.

**Excluded bands and reasoning:**

| #          | Name                                   | Reason                                                                                                                                                                                   |
|------------|----------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 15         | Plankton pelagic community             | Not part of any of the four PDF themes (birds / mammals / fish / benthic).                                                                                                               |
| 21         | Rough bottom aphotic                   | Substrate fraction layer not enumerated in the PDF's 9-layer abiotic model (PDF predates the 2019 baseline expansion). Not associated with reefs or vegetation in the balanced pipeline. |
| 22         | Rough bottom deep                      | Same as 21.                                                                                                                                                                              |
| 23         | Rough bottom photic                    | Same as 21.                                                                                                                                                                              |
| 27, 28, 29 | Soft bottom (aphotic/deep/photic)      | Per PDF, soft bottom feeds the abiotic baseline (step 3.1) which is approximated by the 25-100 normalization on `benthic_total` rather than computed explicitly.                         |
| 31, 32, 33 | Transport bottom (aphotic/deep/photic) | Same as soft bottom.                                                                                                                                                                     |

**Notable deviations from the PDF, documented here for traceability:**

1. **Porpoise reproduction step is collapsed.** The PDF specifies separate
   MAX of reproduction layers and MAX of occurrence layers, then MEAN of the
   two. The Symphony 2019 baseline only includes one porpoise band per
   population (16, 17, 18 = Baltic / Belt / North Sea); there are no separate
   reproduction layers. We therefore produce `porpoise_total = MAX([16, 17, 18])`
   directly. The numeric output equals what `MEAN(MAX(X), MAX(X))` would
   produce, but the config no longer suggests a distinction that doesn't
   exist in the data.

2. **`abiotic_habitats` step (PDF 3.1) is not computed explicitly.** The PDF
   defines step 3.1 as `SUM` of all 9 abiotic habitat layers (= 1 per cell
   with data) and uses 25 in the `benthic_total` 25-100 transform to anchor
   the abiotic baseline. The implementation approximates this by directly
   normalizing the biotic mean to 25-100, which yields the same visual result
   as long as the observed minimum biotic value is ≈ 0 (it usually is). If
   the baseline expands to areas without abiotic data, revisit this.

3. **`reef_environment_presence` averages a 0-100 range with a 0-1 range.**
   `reef_hardbottom_presence` derives from biotic reef bands (already 0-100),
   while `hardbottom_abiotic` derives from substrate-fraction bands (0-100
   nominally but typically much smaller). The PDF prescribes a raw MEAN with
   no intermediate normalization (step 1.1.3), so the reef signal will
   dominate the abiotic floor by design. This matches the PDF literally; if
   the empirical result looks wrong, consider adding 0-100 normalization on
   both inputs.

### 8.3 `pressure/simple.json` — "Röda Kartan, enkel"

**Structure.** Single `MEAN` over 37 pressure bands, normalized 0-100.

**Included bands (37):** 0-16, 19-25, 56-68 (excluding 17, 18, 26-55).

A pressure-band reference table is omitted here for brevity; consult the
seed SQL for full names. Highlights: bottom trawling, gillnet/pelagic catch,
shipping noise/oilspill/turbidity, recreational and energy disturbance,
five habitat-loss categories, heavy metals background/military/mine,
nitrogen/phosphorous, synthetic toxins, oilspill wreck, turbidity sand
extraction.

**Excluded bands and reasoning:**

| #     | Name                                                                                       | Reason                                                                                                                     |
|-------|--------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| 17    | Heavy metals fiber bank                                                                    | Excluded temporarily due to "scrap" data over land regions. Inlcuding it diminishes the visual representation.             |
| 18    | Heavy metals mercury dump                                                                  | Same as 17                                                                                                                 |
| 26-55 | Climate scenario layers (salinity / temperature / ice cover for 2099, RCP 4.5 and RCP 8.5) | Projection layers, not present-day pressures. Including them would mix forecast scenarios with observed/current pressures. |

### 8.4 `pressure/balanced.json` — "Röda Kartan, balanserad"

**Structure.** Eleven category steps, each `MEAN` over its bands, each
normalized 0-100 to make every category contribute equally to the final
heatmap regardless of band count. Final `pressure_total` is `MEAN` over the
eleven category outputs, normalized 0-100.

The category structure mirrors the *Solgraf belastningar* tab (column `Kategori`)
in `Komponenter v8.xlsx`. Every present-day pressure band maps to exactly one
category — no band is shared between categories.

| Category (Excel `Kategori`) | Step name | Bands |
|-----------------------------|-----------|-------|
| Energi | `energy` | 6 Disturbance wind power · 7 Electromagnetic field · 23 Noise 125Hz wind power |
| Fiske | `fishing` | 0 Abrasion bottom trawl · 3 Catch bottom trawl · 4 Catch gillnet · 5 Catch pelagic trawl · 66 Turbidity bottom trawl |
| Fritid | `recreation` | 2 Bird hunt · 25 Noise boating · 60 Pollution boating |
| Förorening | `pollution` | 16 Heavy metals background · 20 Heavy metals mine dump · 58 Oilspill wreck · 61 Synthetic toxins background · 65 Toxic munition dump |
| Försvar | `defence` | 8 Explosions peak · 9 Explosions SEL · 19 Heavy metals military area |
| Industri | `industry` | 62 Synthetic toxins harbor · 63 Synthetic toxins industry |
| Kustexploatering | `coastal-development` | 10 Habitat loss coastal exploitation · 11 Habitat loss dumping · 13 Habitat loss infrastructure · 64 Synthetic toxins treatment plant |
| Mineralutvinning | `mineral-extraction` | 15 Habitat loss sand extraction · 67 Turbidity sand extraction |
| Sjöfart | `shipping` | 22 Noise 125Hz shipping · 24 Noise 2000Hz shipping · 57 Oilspill shipping · 68 Turbidity shipping |
| Vattenbruk | `aquaculture` | 12 Habitat loss fish farm · 14 Habitat loss mussel farm · 56 Nutrients fish farm |
| Övergödning | `eutrophication` | 1 Anoxia background · 21 Nitrogen background · 59 Phosphorous background |

**Bands referenced (37):** identical set to `pressure/simple.json`.

**Excluded bands:** same as `pressure/simple.json` (17, 18, 26-55) — see
section 8.3 for reasoning. Note that bands 17 (fiber bank) and 18 (mercury
dump), though listed under *Förorening* in the Excel, remain excluded due to
data-quality issues (scrap data over land regions).

**Design notes:**

1. **No band is referenced by more than one category.** Each band is assigned
   to the single best-fitting Excel `Kategori`. This avoids implicit
   re-weighting in the final MEAN.

2. **Per-category 0-100 normalization is applied before the final MEAN.**
   Categories have very different band counts (2 to 5). Without normalization,
   categories with high-magnitude pressures dominate the final heatmap
   regardless of band count. Per-category normalization makes each category
   contribute equally — closer to the spirit of "balanced".

3. **Category structure follows stakeholder input.** The eleven categories
   mirror the *Solgraf belastningar* tab in `Komponenter v8.xlsx` exactly.
   Any future re-categorization should be derived from an updated version of
   that document.

---

## 9. Practical authoring workflow (from scratch)

1. **Define output intent**
    - What should the final map represent?
    - Decide which step is `outputStep`.

2. **List source bands per concept**
    - Build explicit mappings from domain concept -> source band indexes.

3. **Design step graph**
    - Create leaf steps from `bands`.
    - Create intermediate/final steps from `inputs`.
    - Assign `order` so every input is produced before it is consumed.
    - Check for circular dependencies — these are not caught at parse time and will produce a misleading "input not found" error at runtime.

4. **Select operation per step**
    - `MEAN` for equal-weight averaging.
    - `MAX` for "any strong signal dominates".
    - `SUM` for additive accumulation.

5. **Decide where to normalize**
    - Add normalization on intermediate steps that should be scale-aligned before a downstream merge.
    - Ensure the final desired scaling is on `outputStep`.

6. **Validate references and indexes**
    - Every `inputs` name must exist and refer to an earlier step.
    - Band indexes must be valid for that layer type dataset.

7. **Run and inspect**
    - Generate a summary model and visually verify the output heatmap.

---

## 10. Validation checklist

- [ ] `titleTranslationKey` is set and exists in all supported language files
- [ ] `outputStep` is set explicitly and matches a step `name`
- [ ] all step `name` values are unique within the file
- [ ] `order` values produce a valid dependency order (inputs always have lower `order` than consumers)
- [ ] no circular dependencies between steps
- [ ] every step has at least one source (`bands` and/or `inputs`)
- [ ] all `inputs` refer to steps with a lower `order` value
- [ ] band indexes are within source coverage dimension range
- [ ] normalization ranges are valid (`max > min`)
- [ ] intermediate steps that feed into a merge are normalized if scale alignment matters
- [ ] robust bounds percentiles, if used, are sensible (`low < high`, typically `1.0`/`99.0` to eliminate outliers)

---

## 11. Common pitfalls

- Referencing an `inputs` step name that does not exist → runtime exception.
- Referencing an `inputs` step with a higher `order` than the consuming step → misleading "input not found" runtime error, not a clear ordering error.
- Defining a step with neither `bands` nor `inputs` → runtime exception.
- Reusing step names accidentally → confusing graph and unexpected value overrides.
- Omitting `outputStep` and relying on the last-by-order fallback → fragile to future reordering.
- Putting final normalization somewhere other than the designated output step.
- Using invalid or out-of-range band indexes.
- Forgetting to add a new `titleTranslationKey` to all language files → UI shows a raw key instead of a label.
- Assuming `SUM`/`MAX` on empty finite data produces zero — it produces `NaN`, later written as `0.0` in raster output.

---

## 12. Notes on performance and memory

- Runtime executes band aggregation row-by-row to reduce peak memory usage.
- Intermediate step arrays are released when no longer referenced.
- Large band lists and many steps increase compute time; keep the model graph as simple as requirements allow.
