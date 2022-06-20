package se.havochvatten.symphony.dto;

import javax.persistence.Embeddable;

@Embeddable
// TODO Create separate subclasses for each type?
public class NormalizationOptions {
    public NormalizationType type;
    public double userDefinedValue; // for type == USER_DEFINED

    public NormalizationOptions() {}

    public NormalizationOptions(NormalizationType type) {
        this.type = type;
    }

    public NormalizationOptions(double value) {
        this.type = NormalizationType.USER_DEFINED;
        this.userDefinedValue = value;
    }
}
