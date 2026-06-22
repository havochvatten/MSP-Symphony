package se.havochvatten.symphony.web.filter;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ResourceInfo;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.junit.Before;
import org.junit.Test;
import se.havochvatten.symphony.service.PropertiesService;

import java.io.IOException;
import java.lang.reflect.Method;
import java.security.Principal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class PublicOrRestrictedFilterTest {

    private static final String PUBLIC_ACCESS_PROP = "symphony.public_access";

    private PublicOrRestrictedFilter filter;
    private PropertiesService props;
    private ResourceInfo resourceInfo;
    private ContainerRequestContext requestContext;
    private SecurityContext securityContext;

    // Fixture used as the "resource method" so the filter sees a @PublicOrRestricted annotation.
    @PublicOrRestricted
    public void annotatedEndpoint() {
    }

    // Fixture without @PublicOrRestricted, to exercise the fail-closed branch.
    public void unannotatedEndpoint() {
    }

    @Before
    public void setUp() throws Exception {
        filter = new PublicOrRestrictedFilter();
        props = mock(PropertiesService.class);
        resourceInfo = mock(ResourceInfo.class);
        requestContext = mock(ContainerRequestContext.class);
        securityContext = mock(SecurityContext.class);

        filter.props = props;
        filter.resourceInfo = resourceInfo;

        when(requestContext.getSecurityContext()).thenReturn(securityContext);

        Method annotated = PublicOrRestrictedFilterTest.class.getMethod("annotatedEndpoint");
        when(resourceInfo.getResourceMethod()).thenReturn(annotated);
    }

    @Test
    public void allowsAnyRequestWhenPublicAccessEnabled() throws IOException {
        when(props.getPropertyAsBool(PUBLIC_ACCESS_PROP, false)).thenReturn(true);

        filter.filter(requestContext);

        verify(requestContext, never()).abortWith(any());
    }

    @Test
    public void rejectsAnonymousWhenPublicAccessDisabled() throws IOException {
        when(props.getPropertyAsBool(PUBLIC_ACCESS_PROP, false)).thenReturn(false);
        when(securityContext.getUserPrincipal()).thenReturn(null);

        filter.filter(requestContext);

        verify(requestContext).abortWith(argThat(
            r -> r.getStatus() == Response.Status.UNAUTHORIZED.getStatusCode()));
    }

    @Test
    public void rejectsAuthenticatedUserWithoutAllowedRoleWhenPublicAccessDisabled() throws IOException {
        when(props.getPropertyAsBool(PUBLIC_ACCESS_PROP, false)).thenReturn(false);
        when(securityContext.getUserPrincipal()).thenReturn(mock(Principal.class));
        when(securityContext.isUserInRole(anyString())).thenReturn(false);

        filter.filter(requestContext);

        verify(requestContext).abortWith(any());
    }

    @Test
    public void allowsAuthenticatedUserInAllowedRoleWhenPublicAccessDisabled() throws IOException {
        when(props.getPropertyAsBool(PUBLIC_ACCESS_PROP, false)).thenReturn(false);
        when(securityContext.getUserPrincipal()).thenReturn(mock(Principal.class));
        when(securityContext.isUserInRole("GRP_SYMPHONY")).thenReturn(true);

        filter.filter(requestContext);

        verify(requestContext, never()).abortWith(any());
    }

    @Test
    public void rejectsWhenNoAnnotationResolvedAndPublicAccessDisabled() throws Exception {
        when(props.getPropertyAsBool(PUBLIC_ACCESS_PROP, false)).thenReturn(false);
        Method unannotated = PublicOrRestrictedFilterTest.class.getMethod("unannotatedEndpoint");
        when(resourceInfo.getResourceMethod()).thenReturn(unannotated);
        // Neither the method nor this (unannotated) class carries @PublicOrRestricted,
        // so getConditionalPublicAnnotation() returns null and the filter must fail closed.
        when(resourceInfo.getResourceClass()).thenReturn((Class) PublicOrRestrictedFilterTest.class);

        filter.filter(requestContext);

        verify(requestContext).abortWith(argThat(
            r -> r.getStatus() == Response.Status.UNAUTHORIZED.getStatusCode()));
    }
}
