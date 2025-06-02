package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.geotools.styling.RasterSymbolizer;
import org.geotools.styling.StyledLayerDescriptor;
import se.havochvatten.symphony.dto.LegendDto;
import se.havochvatten.symphony.service.PropertiesService;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.logging.Logger;
import java.util.stream.IntStream;

@Path("/legend")
@Stateless
@RolesAllowed("GRP_SYMPHONY")
@Api(value = "/legend")
public class LegendREST {
    private static final Logger logger = Logger.getLogger(LegendREST.class.getName());

    @Inject
    private PropertiesService props;

    @GET
    @Path("{type}")
    @ApiOperation(value = "Get legend definition", response = LegendDto.class)
    @Produces({MediaType.APPLICATION_JSON})
    public Response get(
            @ApiParam(  value = "type of legend",
                        allowableValues = "result,ecosystem,pressure,comparison")
            @PathParam("type") String legendType, @QueryParam("maxValue") String maxParam) {
        try {
            var type = LegendDto.Type.valueOf(legendType.toUpperCase());

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
        } catch (IllegalArgumentException e) {
            return Response.noContent().build();
        } catch (Exception e) {
            logger.severe(e.toString());
            return Response.serverError().build();
        }
    }
}
