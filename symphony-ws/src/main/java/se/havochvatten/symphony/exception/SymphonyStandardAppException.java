package se.havochvatten.symphony.exception;

import javax.ejb.ApplicationException;

/**
 * Application exception to be used for checked exceptions which will be unchanged by the EJB container.
 * Should only be used when we want to process the results with a try catch at the client.
 */

@ApplicationException(rollback = true)
public class SymphonyStandardAppException extends Exception {
    private static final long serialVersionUID = 1L;

    private final SymphonyModelErrorCode errorCode;

    public SymphonyStandardAppException(SymphonyModelErrorCode errorCode) {
        super();
        this.errorCode = errorCode;
    }

    public SymphonyStandardAppException(SymphonyModelErrorCode errorCode, Throwable cause) {
        super(cause);
        this.errorCode = errorCode;
    }

    public SymphonyStandardAppException(SymphonyModelErrorCode errorCode, String detailMessage) {
        super(detailMessage);
        this.errorCode = errorCode;
    }

    public SymphonyStandardAppException(SymphonyModelErrorCode errorCode, Throwable cause,
										String detailMessage) {
        super(detailMessage, cause);
        this.errorCode = errorCode;
    }

    public SymphonyModelErrorCode getErrorCode() {
        return errorCode;
    }
}
