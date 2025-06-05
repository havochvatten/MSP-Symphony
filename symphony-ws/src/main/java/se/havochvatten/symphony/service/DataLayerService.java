package se.havochvatten.symphony.service;

import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.io.AbstractGridFormat;
import org.geotools.coverage.grid.io.GridFormatFinder;
import org.geotools.coverage.processing.Operations;
import org.geotools.util.factory.Hints;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.entity.BaselineVersion;

import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import java.io.File;
import java.io.IOException;

@Stateless
public class DataLayerService {

    @EJB
    BaselineVersionService baselineVersionService;

    @EJB
    PropertiesService props;

    // TODO cache instances of layer type and baselineVersionId?
    public GridCoverage2D getCoverage(LayerType type, int baselineVersionId) throws IOException {
        String filename = getComponentFilePath(type, baselineVersionId);
        File file = new File(filename);
        // See https://docs.geotools.org/latest/userguide/library/referencing/order.html
        Hints hints = new Hints(Hints.FORCE_LONGITUDE_FIRST_AXIS_ORDER, Boolean.TRUE);
        AbstractGridFormat format = GridFormatFinder.findFormat(file);
        return format.getReader(file, hints).read(null);
    }

    public GridCoverage2D getDataLayer(LayerType type, int baselineVersionId, int bandNo) throws IOException {
        var coverage = getCoverage(type, baselineVersionId);
        return (GridCoverage2D) Operations.DEFAULT.selectSampleDimension(coverage, new int[]{bandNo});
    }

    String getComponentFilePath(LayerType type, int baselineVersionId) {
        // To use for development purpose
        String localDevFilePath = localDevFilePath(type);
        if (localDevFilePath != null) {
            return localDevFilePath;
        }
        // component file path registered in baselineVersion
        BaselineVersion baselineVersion = baselineVersionService.getBaselineVersionById(baselineVersionId);
        String fileNameAndPath = null;
        if (LayerType.ECOSYSTEM.equals(type)) {
            fileNameAndPath = baselineVersion.getEcosystemsFilePath();
        } else if (LayerType.PRESSURE.equals(type)) {
            fileNameAndPath = baselineVersion.getPressuresFilePath();
        }

        return fileNameAndPath;
    }

    /**
     * For development purpose only.
     *
     * @return local file path for layer type if property found in local properties file. Returns null if not
     * fount in local properties file
     */
    private String localDevFilePath(LayerType type) {
        String fileNameAndPath = null;
        if (LayerType.ECOSYSTEM.equals(type)) {
            fileNameAndPath = props.getProperty("data.localdev.ecosystems");
        } else if (LayerType.PRESSURE.equals(type)) {
            fileNameAndPath = props.getProperty("data.localdev.pressures");
        }
        return fileNameAndPath;
    }
}
