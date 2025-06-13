package se.havochvatten.symphony.dto;

import jakarta.persistence.Embeddable;

@Embeddable
// TODO Create separate subclasses for each type?
public class NormalizationOptions {
    private NormalizationType type;

    private double userDefinedValue;             // for type == USER_DEFINED
    private double stdDevMultiplier;             // for type == STANDARD_DEVIATION

    public NormalizationOptions() {}

    public NormalizationOptions(NormalizationType type) {
        this.type = type;
    }

    public NormalizationOptions(double value) {
        this.type = NormalizationType.USER_DEFINED;
        this.userDefinedValue = value;
    }

    public NormalizationOptions(NormalizationType type, double value) {
        this.type = type;
        this.userDefinedValue = type != NormalizationType.STANDARD_DEVIATION ? value : this.userDefinedValue;
        this.stdDevMultiplier = type == NormalizationType.STANDARD_DEVIATION ? value : this.stdDevMultiplier;
    }

    public NormalizationType getType() {
        return type;
    }

    public double getUserDefinedValue() {
        return userDefinedValue;
    }

    public double getStdDevMultiplier() {
        return stdDevMultiplier;
    }
}
