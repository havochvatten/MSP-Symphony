package se.havochvatten.symphony.web.filter;

import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ResourceInfo;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.ext.Provider;
import se.havochvatten.symphony.service.PropertiesService;

import java.io.IOException;
import java.util.Set;

@Provider
@PublicOrRestricted
@Priority(Priorities.AUTHENTICATION)
public class PublicOrRestrictedFilter implements ContainerRequestFilter {

    @Inject
    private PropertiesService props;

    @Context
    ResourceInfo resourceInfo;

    // Define all roles that should be allowed access
    private static final Set<String> ALLOWED_ROLES = Set.of(
        "GRP_SYMPHONY",
        "GRP_SYMPHONY_ADMIN"
    );


    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {

        boolean publicAccessEnabled = props.getPropertyAsBool("symphony.public_access", false);

        if (publicAccessEnabled) {
            return;
        }

        PublicOrRestricted annotation = getConditionalPublicAnnotation();
        // Safety check
        if (annotation == null) {
            return;
        }

        SecurityContext securityContext = requestContext.getSecurityContext();

        // Check if user is authenticated AND has an allowed role
        boolean isAuthenticated = securityContext != null && securityContext.getUserPrincipal() != null;
        boolean hasAllowedRole = ALLOWED_ROLES.stream()
            .anyMatch(role -> securityContext != null && securityContext.isUserInRole(role));

        // Public mode OFF
        // Require authenticated user
        if (!isAuthenticated || !hasAllowedRole) {
            requestContext.abortWith(
                Response.status(Response.Status.UNAUTHORIZED)
                    .build()
            );
            return;
        }

    }

    private PublicOrRestricted getConditionalPublicAnnotation() {

        // Method-level annotation
        PublicOrRestricted annotation = resourceInfo.getResourceMethod().getAnnotation(PublicOrRestricted.class);

        if (annotation != null) {
            return annotation;
        }

        // Class-level annotation
        return resourceInfo.getResourceClass().getAnnotation(PublicOrRestricted.class);
    }
}

