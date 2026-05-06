package se.havochvatten.symphony.dto;

import java.util.List;

public class SummaryModelConfig {
    private String titleTranslationKey;
    private List<Step> steps;
    private String outputStep;

    public String getTitleTranslationKey() {
        return titleTranslationKey;
    }

    public void setTitleTranslationKey(String titleTranslationKey) {
        this.titleTranslationKey = titleTranslationKey;
    }

    public List<Step> getSteps() {
        return steps;
    }

    public void setSteps(List<Step> steps) {
        this.steps = steps;
    }

    public String getOutputStep() {
        return outputStep;
    }

    public void setOutputStep(String outputStep) {
        this.outputStep = outputStep;
    }

    public static class Normalization {
        private String type;
        private double min;
        private double max;
        private RobustBounds robustBounds;

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public double getMin() {
            return min;
        }

        public void setMin(double min) {
            this.min = min;
        }

        public double getMax() {
            return max;
        }

        public void setMax(double max) {
            this.max = max;
        }

        public RobustBounds getRobustBounds() {
            return robustBounds;
        }

        public void setRobustBounds(RobustBounds robustBounds) {
            this.robustBounds = robustBounds;
        }
    }

    public static class RobustBounds {
        private boolean robustBoundsEnabled;
        private double lowPercentile;
        private double highPercentile;
        private int maxSamples;


        public boolean isRobustBoundsEnabled() {
            return robustBoundsEnabled;
        }

        public void setRobustBoundsEnabled(boolean robustBoundsEnabled) {
            this.robustBoundsEnabled = robustBoundsEnabled;
        }

        public double getLowPercentile() {
            return lowPercentile;
        }

        public void setLowPercentile(double lowPercentile) {
            this.lowPercentile = lowPercentile;
        }

        public double getHighPercentile() {
            return highPercentile;
        }

        public void setHighPercentile(double highPercentile) {
            this.highPercentile = highPercentile;
        }

        public int getMaxSamples() {
            return maxSamples;
        }

        public void setMaxSamples(int maxSamples) {
            this.maxSamples = maxSamples;
        }
    }

    public static class Step {
        private String name;
        private String translationKey;
        private Operation operation;
        private int order;
        private List<Integer> bands;
        private List<String> inputs;
        private Normalization normalization;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getTranslationKey() {
            return translationKey;
        }

        public void setTranslationKey(String translationKey) {
            this.translationKey = translationKey;
        }

        public Operation getOperation() {
            return operation;
        }

        public void setOperation(Operation operation) {
            this.operation = operation;
        }

        public int getOrder() {
            return order;
        }

        public void setOrder(int order) {
            this.order = order;
        }

        public List<Integer> getBands() {
            return bands;
        }

        public void setBands(List<Integer> bands) {
            this.bands = bands;
        }

        public List<String> getInputs() {
            return inputs;
        }

        public void setInputs(List<String> inputs) {
            this.inputs = inputs;
        }

        public Normalization getNormalization() {
            return normalization;
        }

        public void setNormalization(Normalization normalization) {
            this.normalization = normalization;
        }
    }

    // === Response classes for frontend ===
    public static class SummaryModelDescription {
        private String modelKey;
        private String titleTranslationKey;
        private List<StepFormula> steps;

        public String getModelKey() {
            return modelKey;
        }

        public void setModelKey(String modelKey) {
            this.modelKey = modelKey;
        }

        public String getTitleTranslationKey() {
            return titleTranslationKey;
        }

        public void setTitleTranslationKey(String titleTranslationKey) {
            this.titleTranslationKey = titleTranslationKey;
        }

        public List<StepFormula> getSteps() {
            return steps;
        }

        public void setSteps(List<StepFormula> steps) {
            this.steps = steps;
        }
    }

    public static class StepFormula {
        private String name;
        private String translationKey;
        private String operation;
        private List<FormulaInput> formulaInputs;
        private String normalization;
        private boolean hasStepsAsInput;
        private boolean isOutput;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getTranslationKey() {
            return translationKey;
        }

        public void setTranslationKey(String translationKey) {
            this.translationKey = translationKey;
        }

        public String getOperation() {
            return operation;
        }

        public void setOperation(String operation) {
            this.operation = operation;
        }

        public List<FormulaInput> getFormulaInputs() {
            return formulaInputs;
        }

        public void setFormulaInputs(List<FormulaInput> formulaInputs) {
            this.formulaInputs = formulaInputs;
        }

        public String getNormalization() {
            return normalization;
        }

        public void setNormalization(String normalization) {
            this.normalization = normalization;
        }

        public boolean isHasStepsAsInput() {
            return hasStepsAsInput;
        }

        public void setHasStepsAsInput(boolean hasStepsAsInput) {
            this.hasStepsAsInput = hasStepsAsInput;
        }

        public boolean isOutput() {
            return isOutput;
        }

        public void setOutput(boolean isOutput) {
            this.isOutput = isOutput;
        }
    }

    public static class FormulaInput {
        private String name;
        private String displayName;

        public String getDisplayName() {
            return displayName;
        }

        public void setDisplayName(String displayName) {
            this.displayName = displayName;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
