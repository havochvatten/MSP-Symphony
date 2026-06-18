package se.havochvatten.symphony.web.filter;

import jakarta.ws.rs.NameBinding;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.*;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

/**
 * Marks a resource (class or method) whose access depends on the {@code symphony.public_access}
 * flag. When public access is enabled the endpoint is reachable anonymously; otherwise
 * {@link PublicOrRestrictedFilter} requires an authenticated user in one of its allowed roles.
 */
@NameBinding
@Retention(RUNTIME)
@Target({TYPE, METHOD})
public @interface PublicOrRestricted {
}
