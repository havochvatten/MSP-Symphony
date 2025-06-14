package se.havochvatten.symphony.exception;

import se.havochvatten.symphony.dto.FrontendErrorDto;

import jakarta.ejb.EJBAccessException;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import java.util.NoSuchElementException;
import java.util.logging.Level;
import java.util.logging.Logger;

@Provider
public class SymphonyWSExceptionMapper implements ExceptionMapper<Exception> {

    private static final Logger LOGGER = Logger.getLogger(SymphonyWSExceptionMapper.class.getName());

    @Override
    public Response toResponse(Exception e) {
        Response.ResponseBuilder resp;

        if (e instanceof NoSuchElementException)
            resp = Response.status(Response.Status.NO_CONTENT);
        else if (e instanceof NotFoundException)
            resp = Response.status(Response.Status.NOT_FOUND);
        else if (e instanceof BadRequestException)
            resp = Response.status(Response.Status.BAD_REQUEST);
        else if (e instanceof SymphonyStandardAppException ex) {
            LOGGER.log(Level.SEVERE, e::toString);
            resp = Response.status(Response.Status.BAD_REQUEST).
                    entity(new FrontendErrorDto(ex.getErrorCode().getErrorKey(), ex.getErrorCode().getErrorMessage()));
        } else if (e instanceof EJBAccessException || e instanceof NotAuthorizedException) {
            resp = Response.status(Response.Status.UNAUTHORIZED);
        } else {
            LOGGER.log(Level.SEVERE, e.toString(), e);
            resp = Response.status(Response.Status.INTERNAL_SERVER_ERROR).
                    entity(new FrontendErrorDto(SymphonyModelErrorCode.OTHER_ERROR.getErrorKey(), e.toString()));
        }

        return resp.type(MediaType.APPLICATION_JSON_TYPE).build(); // force JSON response
    }
}
