package se.havochvatten.symphony.exception;

import javax.ejb.EJBException;

// Runtime exceptions which will be handled by the EJB container

public class SymphonyStandardSystemException extends EJBException {
    private final SymphonyModelErrorCode errorCode;

    public SymphonyStandardSystemException(SymphonyModelErrorCode errorCode) {
        super(errorCode.getErrorMessage());
        this.errorCode = errorCode;
    }

    public SymphonyStandardSystemException(SymphonyModelErrorCode errorCode, Exception cause) {
        super(cause);
        this.errorCode = errorCode;
    }

    public SymphonyStandardSystemException(SymphonyModelErrorCode errorCode, Exception cause,
										   String detailedMessage) {
        super(detailedMessage, cause);
        this.errorCode = errorCode;
    }

    //	@Override
    public SymphonyModelErrorCode getErrorCode() {
        return errorCode;
    }
}
