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
      <your_model>.json
    pressure/
      <your_model>.json
  <anotherBaselineName>/
    ecosystem/
      ...
```

`<baselineName>` must match `BaselineVersion.name` (case-insensitive). A
baseline with no directory, or a directory that exists but contains no JSON
files for a given category, will cause the overview accordion to be hidden
for that category in the UI.

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
  "title": {
    "en": "My model",
    "sv": "Min modell",
    "fr": "Mon modèle"
  },
  "outputStep": "some_step_name",
  "steps": [
    { "name": "...", "operation": "...", "order": 10, "bands": [0, 1] }
  ]
}
```

### `title` (object, optional)
- Per-language model title shown in the UI dialog header, e.g. `{ "en": "...", "sv": "...", "fr": "..." }`.
- Keys are language codes, expected to be ISO-639-1 compliant and to correspond to the languages present in the baseline metadata. ISO-639-1 compliance is enforced by the import tool, not by the application itself. The set of languages is not fixed — the default UI presently supports English (`en`), French (`fr`) and Swedish (`sv`), which makes `{ "en", "fr", "sv" }` an excellent example to follow.
- The backend resolves the title to the request `locale`: an exact key match wins; otherwise it falls back to the `en` entry, then to the first entry in the map. When the request omits a locale, it defaults to the baseline's configured default locale. If the map is empty or absent, a default label derived from the type and model key (`<type>:<modelKey>`) is used.
- Labels live in this file — there are no separate i18n files to keep in sync.

### `name` (object, optional)
- Per-language **short** label shown in the model picker, e.g. `{ "en": "Simple model", "sv": "Enkel modell", "fr": "Modèle simple" }`. Distinct from `title` (the longer dialog header).
- Surfaced by `GET /datalayer/{baseline}/{type}/models`, which returns `[{ "key": "<modelKey>", "name": "<resolved label>" }]`. `name` is resolved per request `locale` (`?locale=`) with the same logic as `title`: exact key match, else the `en` entry, else the first entry, and only the model key if no labels are defined. When the request omits a locale, it defaults to the baseline's configured default locale.

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
  "label": {
    "en": "Bird total",
    "sv": "Fågel total",
    "fr": "Oiseaux total"
  },
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

### `label` (object, optional)
- Per-language step name shown in the UI, same shape as `title`.
- The backend resolves it to the request `locale` with the same logic as `title`: exact key match, else the `en` entry, else the first entry, and only the step `name` if no labels are defined.

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
  "title": { "en": "My model", "sv": "Min modell", "fr": "Mon modèle" },
  "outputStep": "total",
  "steps": [
    {
      "name": "total",
      "label": { "en": "Total", "sv": "Total", "fr": "Total" },
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
---

## 7. Balanced/hierarchical template (multi-step)

Use this when themes/sub-groups are computed first, then merged.

```json
{
  "title": { "en": "My model", "sv": "Min modell", "fr": "Mon modèle" },
  "outputStep": "total",
  "steps": [
    { "name": "group_a", "operation": "MEAN", "order": 10, "bands": [0, 1, 2] },
    { "name": "group_b", "operation": "MAX",  "order": 20, "bands": [3, 4] },
    {
      "name": "total",
      "label": { "en": "Total", "sv": "Total", "fr": "Total" },
      "operation": "MEAN",
      "order": 30,
      "inputs": ["group_a", "group_b"],
      "normalization": { "type": "linear", "min": 0, "max": 100 }
    }
  ]
}
```
---

## 8. Practical authoring workflow (from scratch)

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

## 9. Validation checklist

- [ ] `title` is set with an entry for each language present in the baseline metadata (ISO-639-1 codes; the default UI uses `en`, `fr`, `sv`)
- [ ] `name` (short picker label) is set with an entry for each of those languages
- [ ] each step `label`, where present, has an entry for each of those languages
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

## 10. Common pitfalls

- Referencing an `inputs` step name that does not exist → runtime exception.
- Referencing an `inputs` step with a higher `order` than the consuming step → misleading "input not found" runtime error, not a clear ordering error.
- Defining a step with neither `bands` nor `inputs` → runtime exception.
- Reusing step names accidentally → confusing graph and unexpected value overrides.
- Omitting `outputStep` and relying on the last-by-order fallback → fragile to future reordering.
- Putting final normalization somewhere other than the designated output step.
- Using invalid or out-of-range band indexes.
- Leaving a language out of a `title`/`label` map → the backend falls back to the `en` entry, then to the first entry in the map, for that locale instead of the requested localized label (the type/model key or step `name` is used only when the map is empty).
- Assuming `SUM`/`MAX` on empty finite data produces zero — it produces `NaN`, later written as `0.0` in raster output.

---

## 11. Notes on performance and memory

- Runtime executes band aggregation row-by-row to reduce peak memory usage.
- Intermediate step arrays are released when no longer referenced.
- Large band lists and many steps increase compute time; keep the model graph as simple as requirements allow.
