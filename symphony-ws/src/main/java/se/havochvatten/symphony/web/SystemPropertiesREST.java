package se.havochvatten.symphony.web;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.security.PermitAll;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import se.havochvatten.symphony.dto.SystemPropertiesDto;
import se.havochvatten.symphony.service.PropertiesService;

@Stateless
@Tag(name = "/systemproperties")
@PermitAll
@Path("systemproperties")
public class SystemPropertiesREST {
    @Inject
    private PropertiesService props;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getSystemProperties() {
        boolean publicAccess = props.getPropertyAsBool("symphony.public_access", false);
        SystemPropertiesDto properties = new SystemPropertiesDto(publicAccess);
        return Response.ok(properties).build();
    }
}
