package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.dto.FrontendErrorDto;
import se.havochvatten.symphony.dto.UserDto;
import se.havochvatten.symphony.dto.UserLoginDto;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.service.PropertiesService;
import se.havochvatten.symphony.service.UserService;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.security.Principal;

@Stateless
@Path("/")
@Api(value = "/")
public class LoginREST {
    private static final Logger LOG = LoggerFactory.getLogger(LoginREST.class);

    @EJB
    PropertiesService propertiesService;

    @EJB
    UserService userService;

    @SuppressWarnings("rawtypes")
    @ApiOperation(value = "Login to application", response = UserDto.class)
    @POST
    @Path("/login")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response login(@Context HttpServletRequest req, UserLoginDto user) {
        Principal thePrincipal = req.getUserPrincipal();

        // Only login if not already logged in...
        if (thePrincipal == null || !thePrincipal.getName().equals(user.getUsername())) {
            try {
                if (thePrincipal != null) {
                    logout(req);
                }
                return loginUser(req, user);
            } catch (ServletException e) {
                LOG.info("User {} failed to login with error: {}", user.getUsername(), e.getMessage());
                LOG.debug("Login failure", e);
                return Response.status(Response.Status.UNAUTHORIZED).entity(new FrontendErrorDto(SymphonyModelErrorCode.LOGIN_FAILED_ERROR.getErrorKey(), SymphonyModelErrorCode.LOGIN_FAILED_ERROR.getErrorMessage())).build();
            } catch (IOException e) {
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new FrontendErrorDto(SymphonyModelErrorCode.OTHER_ERROR.getErrorKey(), SymphonyModelErrorCode.OTHER_ERROR.getErrorMessage())).build();
            }
        } else {
            LOG.debug("User {} was already logged in. Creating new session.", user.getUsername());
            try {
                logout(req);
                return loginUser(req, user);
            } catch (ServletException e) {
                LOG.info("User {} failed to logout with error: {}", user.getUsername(), e.getMessage());
                LOG.debug("Logout failure", e);
                return Response.status(Response.Status.UNAUTHORIZED).entity(new FrontendErrorDto(SymphonyModelErrorCode.OTHER_ERROR.getErrorKey(), SymphonyModelErrorCode.OTHER_ERROR.getErrorMessage())).build();
            } catch (IOException e) {
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new FrontendErrorDto(SymphonyModelErrorCode.OTHER_ERROR.getErrorKey(), SymphonyModelErrorCode.OTHER_ERROR.getErrorMessage())).build();
            }
        }
    }

    @SuppressWarnings("rawtypes")
    private Response loginUser(HttpServletRequest req, UserLoginDto user) throws ServletException, IOException {
        LOG.debug("User {} is being logged in", user.getUsername());
        req.getSession();
        req.login(user.getUsername(), user.getPassword());
        if (req.isUserInRole(propertiesService.getProperty("symphony.user")) || req.isUserInRole(propertiesService.getProperty("symphony.admin"))) {
            LOG.info("User {} logged in", user.getUsername());
            UserDto userDto = userService.getUser(req.getUserPrincipal());
            return Response.ok(userDto).build();
        } else {
            LOG.warn("Authorization failed. User {} is not member of any allowed group.",
                    user.getUsername());
            logout(req);
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
    }

    @ApiOperation(value = "Get already logged in user", response = UserDto.class)
    @GET
    @Path("/getuser")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUser(@Context HttpServletRequest req) {
        LOG.debug("Trying to get user from session");
        Principal principal = req.getUserPrincipal();
        if (principal == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        } else {
            // there is an existing session, return it
            LOG.info("Getting user {} from session", principal.getName());
            try {
                UserDto user = userService.getUser(principal);
                return Response.ok(user).build();
            } catch (Exception e) {
                LOG.error("Error getting user from session", e);
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new FrontendErrorDto(SymphonyModelErrorCode.OTHER_ERROR.getErrorKey(), SymphonyModelErrorCode.OTHER_ERROR.getErrorMessage())).build();
            }
        }
    }

    @ApiOperation(value = "Logout")
    @POST
    @Path("/logout")
    @Produces(MediaType.APPLICATION_JSON)
    public Response logout(@Context HttpServletRequest req) throws ServletException {
        Principal principal = req.getUserPrincipal();
        if (principal == null) {
            return Response.ok().build();
        }
        LOG.info("Logging out user {}", principal.getName());
        req.logout();
        req.getSession().invalidate();
        return Response.ok().build();
    }
}

