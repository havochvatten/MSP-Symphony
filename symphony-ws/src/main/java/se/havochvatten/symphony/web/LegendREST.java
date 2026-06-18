package se.havochvatten.symphony.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.security.PermitAll;
import org.geotools.styling.RasterSymbolizer;
import org.geotools.styling.StyledLayerDescriptor;
import org.xml.sax.SAXException;
import se.havochvatten.symphony.dto.LegendDto;
import se.havochvatten.symphony.service.PropertiesService;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import se.havochvatten.symphony.web.filter.PublicOrRestricted;

import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.util.logging.Logger;
import java.util.stream.IntStream;

import static se.havochvatten.symphony.dto.LegendDto.Type.*;

@Path("/legend")
@Stateless
@RolesAllowed("GRP_SYMPHONY")
@Tag(name ="/legend")
public class LegendREST {
    private static final Logger logger = Logger.getLogger(LegendREST.class.getName());

    @Inject
    private PropertiesService props;

    @GET
    @Path("{type}")
    @Operation(summary = "Get legend definition")
    @Produces({MediaType.APPLICATION_JSON})
    public Response get(
            @Parameter(description = "type of legend")
            @PathParam("type") String legendType, @QueryParam("maxValue") String maxParam) {
        try {
            var type = LegendDto.Type.valueOf(legendType.toUpperCase());
            return getResponse(maxParam, type);
        } catch (IllegalArgumentException e) {
            return Response.noContent().build();
        } catch (Exception e) {
            logger.severe(e.toString());
            return Response.serverError().build();
        }
    }

    @GET
    @Path("/public/{type}")
    @Operation(summary = "Get publicly available legend definition")
    @Produces({MediaType.APPLICATION_JSON})
    @PermitAll
    @PublicOrRestricted
    public Response getPublicType(
        @Parameter(description = "type of public legend")
        @PathParam("type") String legendType, @QueryParam("maxValue") String maxParam) {
        try {
            var type = LegendDto.Type.valueOf(legendType.toUpperCase());
            if (!isPublicType(type)) {
                return Response.noContent().build();
            }
            return getResponse(maxParam, type);
        } catch (IllegalArgumentException e) {
            return Response.noContent().build();
        } catch (Exception e) {
            logger.severe(e.toString());
            return Response.serverError().build();
        }
    }

    private boolean isPublicType(LegendDto.Type reqLegendType) {
        return ECOSYSTEM.equals(reqLegendType) || PRESSURE.equals(reqLegendType) || RESULT.equals(reqLegendType);
    }

    private Response getResponse(String maxParam, LegendDto.Type type) throws ParserConfigurationException, SAXException, IOException {
        // parsing instead of directly typing 'dynamicMax' query parameter for locale independence
        // arbitrarily use 0.0001 as threshold if dynamic max = 0, to provide "mappable" range
        // nb: duplicate calls to parseDouble() are intentional here since we need a final variable for lambda
        final Double dynamicMax = maxParam != null ?
            (Double.parseDouble(maxParam) == 0 ? 0.0001 : Double.parseDouble(maxParam)) : null;

        StyledLayerDescriptor sld =
            WebUtil.getSLD(LegendREST.class.getClassLoader().getResourceAsStream(props.getProperty(
                "data.styles." + type.toString().toLowerCase())));

        RasterSymbolizer symbolizer = WebUtil.getRasterSymbolizer(sld);

        var legend = new LegendDto();
        switch (type) {
            case RESULT, COMPARISON:
                legend.setUnit("%");
                break;
            case ECOSYSTEM, PRESSURE:
                legend.setUnit(null);
                break;
        }
        var entries = symbolizer.getColorMap().getColorMapEntries();
        legend.setColorMap(IntStream.range(0, symbolizer.getColorMap().getColorMapEntries().length)
            .skip(type != LegendDto.Type.COMPARISON ? 1 : 0)
            .mapToObj(index -> new LegendDto.ColorMapEntry(entries[index], type, index, dynamicMax))
            .toArray(LegendDto.ColorMapEntry[]::new));

        return Response.ok(legend).build();
    }
}
