package se.havochvatten.symphony.dto;

public enum NormalizationType {
    /**
     * Normalize wrt to max value of area
     */
    AREA,
    /**
     * Normalize wrt to max value in domain (MSP)
     */
    DOMAIN,
    /**
     * Normalize wrt to user-specified value
     */
    USER_DEFINED,
    /**
     * Normalize wrt to value below for a certain percentile.
     * <p>
     * Used to calibrate DOMAIN normalization. Resulting value saved in database. The percentile to be used is
     * set in properties (default to 95th)
     */
    PERCENTILE
}
