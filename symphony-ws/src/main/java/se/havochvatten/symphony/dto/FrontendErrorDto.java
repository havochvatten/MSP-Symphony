package se.havochvatten.symphony.dto;

import org.slf4j.MDC;

public class FrontendErrorDto {
    String errorCode;
    String errorMessage;
    String requestId = MDC.get("requestId");

    public FrontendErrorDto(String errorCode, String errorMessage) {
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getRequestId() {
        return requestId;
    }
}
