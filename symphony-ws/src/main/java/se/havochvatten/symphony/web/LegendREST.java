package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.geotools.styling.RasterSymbolizer;
import org.geotools.styling.StyledLayerDescriptor;
import se.havochvatten.symphony.dto.LegendDto;
import se.havochvatten.symphony.service.PropertiesService;

import javax.annotation.security.RolesAllowed;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Arrays;
import java.util.logging.Logger;

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
    public Response get(@ApiParam(value = "type of legend", allowableValues = "result,ecosystem,pressure," +
			"comparison") @PathParam("type") String legendType) {
        try {
            var type = LegendDto.Type.valueOf(legendType.toUpperCase());

            StyledLayerDescriptor sld =
					WebUtil.getSLD(LegendREST.class.getClassLoader().getResourceAsStream(props.getProperty(
							"data.styles." + type.toString().toLowerCase())));

            RasterSymbolizer symbolizer = WebUtil.getRasterSymbolizer(sld);

            var legend = new LegendDto();
            switch (type) {
                case RESULT:
                case COMPARISON:
                    legend.unit = "%";
                    break;
                case ECOSYSTEM:
                case PRESSURE:
                    legend.unit = null;
                    break;
            }
            legend.colorMap =
					Arrays.stream(symbolizer.getColorMap().getColorMapEntries())
							.map(entry -> new LegendDto.ColorMapEntry(entry, type))
							.toArray(LegendDto.ColorMapEntry[]::new);

            return Response.ok(legend).build();
        } catch (IllegalArgumentException e) {
            return Response.noContent().build();
        } catch (Exception e) {
            logger.severe(e.toString());
            return Response.serverError().build();
        }
    }
}
