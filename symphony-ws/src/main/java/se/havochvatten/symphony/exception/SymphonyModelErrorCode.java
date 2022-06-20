package se.havochvatten.symphony.exception;

public enum SymphonyModelErrorCode implements SymphonyErrorCode {
    USER_FIND_ERROR("USER_FIND_ERROR", "Error when finding user."),
    USER_SAVE_ERROR("USER_SAVE_ERROR", "Could not save user."),
    USER_EXISTS_ERROR("USER_EXISTS_ERROR", "The user already exists."),
    LDAP_SEARCH_ERROR("LDAP_SEARCH_ERROR", "Error when fetching LDAP user info."),
    LOGIN_FAILED_ERROR("LOGIN_FAILED_ERROR", "Login failed."),
    USER_DEF_AREA_BY_ID_ERROR("USER_DEF_AREA_BY_ID_ERROR", "Error searching UserDefinedAreaById."),
    USER_DEF_AREA_ID_ERROR("USER_DEF_AREA_ID_ERROR", "Id can not be set when creating a UserDefinedArea."),
    USER_DEF_AREA_NAME_EXISTS("USER_DEF_AREA_NAME_EXISTS", "The name of UserDefinedArea already exists."),
    USER_DEF_AREA_NAME_EXISTS_ON_OTHER("USER_DEF_AREA_NAME_EXISTS_ON_OTHER", "Name already exists on another UserDefinedArea."),
    USER_DEF_AREA_NOT_FOUND("USER_DEF_AREA_NOT_FOUND", "UserDefinedArea not found."),
    USER_DEF_AREA_POLYGON_MAPPING_ERROR("USER_DEF_AREA_POLYGON_MAPPING_ERROR", "Error when mapping polygon for UserDefinedArea"),
    USER_DEF_AREA_NOT_OWNED_BY_USER("USER_DEF_AREA_NOT_OWNED_BY_USER", "The requested UserDefinedArea is not owned by logged in user"),
    CALC_AREA_SENS_MATRIX_NOT_FOUND("CALC_AREA_SENS_MATRIX_NOT_FOUND","CalcAreaSensMatrix not found."),
    CALCULATION_AREA_NOT_FOUND("CALCULATION_AREA_NOT_FOUND", "CalculationArea not found."),
    CALCULATION_AREA_MULTIPLE_DEFAULT_AREAS("CALCULATION_AREA_MULTIPLE_DEFAULT_AREAS", "The selected polygon must not belong to multiple default areas."),
    SENSITIVITY_MATRIX_NOT_FOUND("SENSITIVITY_MATRIX_NOT_FOUND", "SensitivityMatrix not found."),
    SENSITIVITY_MATRIX_NOT_OWNED_BY_USER("SENSITIVITY_MATRIX_NOT_OWNED_BY_USER", "The requested SensitivityMatrix is not owned by the user logged in"),
    SENSITIVITY_MATRIX_NAME_ALREADY_EXISTS("SENSITIVITY_MATRIX_NAME_ALREADY_EXISTS", "The SensitivityMatrix name already exists for owner and baseline"),
    NATIONAL_AREA_NOT_FOUND("NATIONAL_AREA_NOT_FOUND", "National area not found."),
    MAPPING_OBJECT_TO_POLYGON_STRING_ERROR("MAPPING_OBJECT_TO_POLYGON_STRING_ERROR", "Error when mappin object to polygon string"),
    AREA_TYPE_FIND_ERROR("AREA_TYPE_FIND_ERROR", "Error when finding areatype."),
    AREA_TYPE_SAVE_ERROR("AREA_TYPE_SAVE_ERROR", "Could not save areatype."),
    AREA_TYPE_EXISTS_ERROR("AREA_TYPE_EXISTS_ERROR", "The areatype already exists."),
    AREA_TYPE_NAME_EXISTS_ON_OTHER("AREA_TYPE_NAME_EXISTS_ON_OTHER", "Name already exists on another AreaType."),
    AREA_TYPE_NOT_FOUND("AREA_TYPE_NOT_FOUND", "AreaType not found."),
    AREA_TYPE_USED("AREA_TYPE_USED", "AreaType is used in another table, can not be deleted."),
    POLYGON_ARRAY_FORBIDDEN("POLYGON_ARRAY_FORBIDDEN","Array of polygons not allowed"),
    GEOJSON_TO_GEOMETRY_CONVERSION_ERROR("GEOJSON_TO_GEOMETRY_CONVERSION_ERROR","Error when converting GeoJSON to Geometry"),
    BASELINE_VERSION_MULT_MATCHES("BASELINE_VERSION_MULT_MATCHES","Multiple BaselineVersion matches found"),
    BASELINE_VERSION_NOT_FOUND("BASELINE_VERSION_NOT_FOUND","BaselineVersion not found"),
    BASELINE_VERSION_VALID_MINDATE_NOT_FOUND("BASELINE_VERSION_VALID_MINDATE_NOT_FOUND","No valid mindate for BaselineVersion found for the requested date"),
    COMPONENT_FILE_PATH_MULT_MATCHES("COMPONENT_FILE_PATH_MULT_MATCHES","Multiple ComponentFilePath matches found"),
    COMPONENT_FILE_PATH_NOT_FOUND("COMPONENT_FILE_PATH_NOT_FOUND","ComponentFilePath not found"),
    METADATA_NOT_FOUND_FOR_ID("METADATA_NOT_FOUND_FOR_ID", "Metadata not found for requested id."),
    JSON_DESERIALIZATION_ERROR("JSON_DESERIALIZATION_ERROR", "Failed to deserialize stored JSON data"),
    GEOPACKAGE_INSPECTION_ERROR("GEOPACKAGE_INSPECTION_ERROR", "General GeoPackage inspection error"),
    GEOPACKAGE_NO_FEATURES("GEOPACKAGE_NO_FEATURES", "No features in GeoPackage"),
    GEOPACKAGE_OPEN_ERROR("GEOPACKAGE_OPEN_ERROR", "Failed to open GeoPackage"),
    NOT_A_GEOPACKAGE("NOT_A_GEOPACKAGE", "File not a GeoPackage"),
    GEOPACKAGE_MISSING_GEOMETRY("GEOPACKAGE_MISSING_GEOMETRY", "GeoPackage feature has no geometry"),
    GEOPACKAGE_READ_FEATURE_FAILURE("GEOPACKAGE_READ_FEATURE_FAILURE", "Failed reading features from " +
        "GeoPackage"),
    GEOPACKAGE_REPROJECTION_FAILED("GEOPACKAGE_REPROJECTION_FAILED", "Failed reprojection GeoPackage polygon"),
    OTHER_ERROR("OTHER_ERROR", "Other error");

    private final String key;
    private final String message;

    SymphonyModelErrorCode(String key, String message) {
        this.key = key;
        this.message = message;
    }

    @Override
    public String getErrorMessage() {
        return message;
    }

    public String getErrorKey() {
        return key;
    }

    public static SymphonyModelErrorCode find(String code) {
        for (SymphonyModelErrorCode errorCode : SymphonyModelErrorCode.values()) {
            if (errorCode.getErrorKey().equals(code)) {
                return errorCode;
            }
        }
        return null;
    }
}
