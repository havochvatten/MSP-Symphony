# Heatmap model config guide (`*ModelConfig.json`)

This guide explains how to create and maintain heatmap model config files from scratch.

Current examples in this folder:
- `EcosystemSimpleModelConfig.json`
- `EcosystemBalancedModelConfig.json`
- `PressureSimpleModelConfig.json`
- `PressureBalancedModelConfig.json`

The runtime logic for these configs is implemented in `DataLayerService`.

---

## 1. What a model config does

A model config defines a **step pipeline** that transforms one source raster (multiple bands) into one output heatmap (single band):

1. Read source bands from ecosystem/pressure coverage
2. Compute one or more named steps using `MEAN`, `MAX`, or `SUM`
3. Optionally normalize step outputs (typically linear `0..100`)
4. Select one step as final output (`outputStep`)

---

## 2. Root-level schema

```json
{
  "outputStep": "some_step_name",
  "steps": [
    { "name": "...", "operation": "...", "order": 10, "bands": [0, 1] }
  ]
}
```

### `outputStep` (string)
- Name of the step that becomes the returned heatmap.
- Must match one step `name`.
- If omitted/blank, runtime falls back to the last step by `order`.
- Recommended: always set it explicitly for clarity.

### `steps` (array, required)
- Ordered logically by each step's `order` integer.
- Runtime sorts by `order` before execution.
- Each step should have a unique `name`.

---

## 3. Step schema

Each step object supports:

```json
{
  "name": "step_name",
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

### `operation` (string, optional but recommended)
- Supported values: `MEAN`, `MAX`, `SUM`.
- Case-insensitive in runtime.
- If omitted/null, defaults to `MEAN`.

### `order` (integer, required)
- Execution priority (ascending).
- Use gaps (`10, 20, 30`) so future steps can be inserted.

### `bands` (array of integers, optional)
- Band indexes from source raster coverage.
- Zero-based indexes.
- Can be combined with `inputs` in the same step.

### `inputs` (array of strings, optional)
- Names of previously computed steps.
- Runtime throws an error if an input name is missing.

### `normalization` (object, optional)
- Applied **to this step output only**.
- For current models, final normalization belongs on the `outputStep` itself.

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
"robustBounds": {
  "robustBoundsEnabled": true,
  "lowPercentile": 2.0,
  "highPercentile": 98.0,
  "maxSamples": 200000
}
```

Behavior when enabled:
- Uses sampled percentiles instead of raw min/max as source bounds.
- Reduces outlier influence on stretch.
- If robust estimation is unreliable (too few finite samples, invalid percentiles/range), runtime falls back to regular min/max.

If `robustBounds` is omitted, behavior is equivalent to disabled.

---

## 6. Simple model template (one-step)

Use this when a model is just one aggregate over many bands.

```json
{
  "outputStep": "my_total",
  "steps": [
    {
      "name": "my_total",
      "operation": "MEAN",
      "order": 10,
      "bands": [0, 1, 2],
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
  ]
}
```

Matches pattern used by:
- `EcosystemSimpleModelConfig.json`
- `PressureSimpleModelConfig.json`

---

## 7. Balanced/hierarchical template (multi-step)

Use this when themes/sub-groups are computed first, then merged.

```json
{
  "outputStep": "total",
  "steps": [
    { "name": "group_a", "operation": "MEAN", "order": 10, "bands": [0, 1, 2] },
    { "name": "group_b", "operation": "MAX",  "order": 20, "bands": [3, 4] },
    {
      "name": "total",
      "operation": "MEAN",
      "order": 30,
      "inputs": ["group_a", "group_b"],
      "normalization": { "type": "linear", "min": 0, "max": 100 }
    }
  ]
}
```

Matches pattern used by:
- `EcosystemBalancedModelConfig.json`
- `PressureBalancedModelConfig.json`

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
   - Assign `order` so every input is produced before consumed.

4. **Select operation per step**
   - `MEAN` for equal-weight averaging.
   - `MAX` for “any strong signal dominates”.
   - `SUM` for additive accumulation.

5. **Decide where to normalize**
   - Add normalization on steps that should be scale-aligned before downstream merge.
   - Ensure final desired scaling is on `outputStep`.

6. **Validate references and indexes**
   - Every `inputs` name must exist.
   - Band indexes must be valid for that layer type dataset.

7. **Run and inspect**
   - Generate heatmap.
   - Check timing logs and value plausibility.
   - Compare simple vs balanced behavior if both exist.

---

## 9. Validation checklist

- [ ] `outputStep` exists and matches a step `name`
- [ ] all step names are unique
- [ ] `order` values produce valid dependency order
- [ ] every step has at least one source (`bands` and/or `inputs`)
- [ ] all `inputs` refer to earlier steps
- [ ] band indexes are within source coverage dimension range
- [ ] normalization ranges are valid (`max > min`)
- [ ] robust bounds percentiles, if used, are sensible (`low < high`, typically 1-2/99-98)

---

## 10. Common pitfalls

- Referencing an input step name that does not exist -> runtime exception.
- Defining a step with neither `bands` nor `inputs` -> runtime exception.
- Reusing names accidentally -> confusing graph and unexpected overrides.
- Putting final normalization somewhere other than the designated output step.
- Using invalid or out-of-range band indexes.
- Assuming `SUM`/`MAX` on empty finite data produces zero (it produces `NaN`, later written as 0 in raster output).

---

## 11. Notes on performance and memory

- Runtime executes band aggregation row-by-row to reduce peak memory usage.
- Intermediate step arrays are released when no longer referenced.
- Large band lists and many steps increase compute time; keep model graph as simple as requirements allow.
