package se.havochvatten.symphony.service;

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import se.havochvatten.symphony.dto.LayerType;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;

import java.io.IOException;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class DataLayerServiceTest {
    DataLayerService dataLayerService = new DataLayerService();
    String filepathEco = "/test/eco/test_eco.tiff";
    BaselineVersion baselineVersion = new BaselineVersion();
    int baseLineVersionId = 1;

    @Before
    public void setUp() {
        dataLayerService.baselineVersionService = mock(BaselineVersionService.class);
        dataLayerService.props = mock(PropertiesService.class);
        baselineVersion.setId(1);
        baselineVersion.setEcosystemsFilePath(filepathEco);
        when(dataLayerService.baselineVersionService.getBaselineVersionById(baseLineVersionId)).thenReturn(baselineVersion);
    }

    @Test
    public void TestComponentGetFilePath() throws SymphonyStandardAppException {
        when(dataLayerService.props.getProperty("data.localdev.ecosystems")).thenReturn(null);
        String resp = dataLayerService.getComponentFilePath(LayerType.ECOSYSTEM, baseLineVersionId);
        assertEquals(filepathEco, resp);
    }

    @Test
    public void TestComponentGetFilePathLocal() throws SymphonyStandardAppException {
        String localFilePath = "/local/test.tiff";
        when(dataLayerService.props.getProperty("data.localdev.ecosystems")).thenReturn(localFilePath);
        String resp = dataLayerService.getComponentFilePath(LayerType.ECOSYSTEM, baseLineVersionId);
        assertEquals(localFilePath, resp);
    }

    @Test
    @Ignore
    public void getDataLayer() throws IOException, SymphonyStandardAppException {
        // FIXME mock since rasters are not available on Jenkins
        var cov = dataLayerService.getDataLayer(LayerType.ECOSYSTEM, 1, 1);
        assertEquals(1, cov.getNumSampleDimensions());
    }
}
