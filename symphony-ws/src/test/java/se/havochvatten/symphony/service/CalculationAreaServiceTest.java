package se.havochvatten.symphony.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.geotools.geojson.geom.GeometryJSON;
import org.junit.Before;
import org.junit.Test;
import org.locationtech.jts.geom.Geometry;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import se.havochvatten.symphony.dto.*;
import se.havochvatten.symphony.entity.SensitivityMatrix;
import se.havochvatten.symphony.entity.*;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.entity.Scenario;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.Matchers.*;
import static org.mockito.Mockito.*;

public class CalculationAreaServiceTest {
    CalculationAreaService calculationAreaService = new CalculationAreaService();
    List<AreaMatrixMapping> relevantSelectedAreaMatrices;
    List<CalculationArea> defaultAreas;
    List<CalculationArea> userDefinedAreas;
    Geometry selectedPolygon;
    Double row1Col1Value = 0.2, row1Col2Value = 0.25;
    Double row2Col1Value = 0.3, row2Col2Value = 0.35;

    @Before
    public void setUp() {
        // Default areas to be used (HaV MSP-areas)
        defaultAreas = new ArrayList<>();
        CalculationArea defaultArea = new CalculationArea();
        List<CaPolygon> defaultAreaPolygons = new ArrayList<>();
        CaPolygon defaultAreaPolygon = new CaPolygon();
        defaultAreaPolygon.setPolygon("[testarea1]");
        defaultAreaPolygons.add(defaultAreaPolygon);
        defaultArea.setCaPolygonList(defaultAreaPolygons);
        defaultArea.setCareaDefault(true);
        SensitivityMatrix defaultSensyMatrix = new SensitivityMatrix();
        defaultSensyMatrix.setId(1);
        defaultArea.setdefaultSensitivityMatrix(defaultSensyMatrix);
        defaultAreas.add(defaultArea);

        // User defined areas to be used
        userDefinedAreas = new ArrayList<>();
        CalculationArea userDefinedArea = new CalculationArea();
        List<CaPolygon> userDefinedAreaPolygons = new ArrayList<>();
        CaPolygon userDefinedAreaPolygon1 = new CaPolygon();
        userDefinedAreaPolygon1.setPolygon("[n-area1]");
        userDefinedAreaPolygons.add(userDefinedAreaPolygon1);
        CaPolygon userDefinedAreaPolygon2 = new CaPolygon();
        userDefinedAreaPolygon2.setPolygon("[n-area2]");
        userDefinedAreaPolygons.add(userDefinedAreaPolygon2);
        userDefinedArea.setCaPolygonList(userDefinedAreaPolygons);
        userDefinedArea.setCareaDefault(true);
        userDefinedArea.setId(2);
        userDefinedAreas.add(userDefinedArea);

        // Relevant areas from request (areas in the request that area within selectedPolygon)
        relevantSelectedAreaMatrices = new ArrayList<>();
		AreaMatrixMapping areaMatrixMapping = new AreaMatrixMapping(2, 3);
        relevantSelectedAreaMatrices.add(areaMatrixMapping);

        calculationAreaService.baselineVersionService = mock(BaselineVersionService.class);
    }

    @Test
    public void testgGetAreaMatrixResponseDtos() throws SymphonyStandardAppException {
        CalculationAreaService calculationAreaServiceSpy = Mockito.spy(calculationAreaService);

        selectedPolygon = jsonToGeometry("{ \"type\": \"Polygon\", \"coordinates\": [ [ [ 18" +
				".303030401845312, 61.685289442684343 ], [ 18.303030401845312, 61.685289442684343 ]," +
                "[ 18.90515925630568, 61.70801128624889 ], [ 18.882437412741137, 62.162448157539735 ], [ 18" +
				".303030401845312, 61.685289442684343 ] ] ] }");

        List<Geometry> cutAreasDefault = new ArrayList<>();
        String cutAreaDefaultString = "{ \"type\": \"Polygon\", \"coordinates\": [ [ [ 18.303030401845312, " +
				"61.685289442684343 ], [ 18.303030401845312, 61.685289442684343 ]," +
                "[ 18.90515925630568, 61.70801128624889 ], [ 18.882437412741137, 62.162448157539735 ], [ 18" +
				".303030401845312, 61.685289442684343 ] ] ] }";
        cutAreasDefault.add(jsonToGeometry(cutAreaDefaultString));

        List<Geometry> cutAreasUser = new ArrayList<>();
        String cutAreasUserString = "{ \"type\": \"Polygon\", \"coordinates\": [ [ [ 18.303030401845312, 61" +
				".685289442684343 ], [ 18.303030401845312, 61.685289442684343 ]," +
                "[ 18.90515925630568, 61.70801128624889 ], [ 18.882437412741137, 62.162448157539735 ], [ 18" +
				".303030401845312, 61.685289442684343 ] ] ] }";
        cutAreasUser.add(jsonToGeometry(cutAreasUserString));

        doReturn(cutAreasDefault)
                .doReturn(cutAreasUser)
                .when(calculationAreaServiceSpy).withinSelectedPolygon(any(Geometry.class), anyList());

        List<AreaMatrixResponse> areaMatrixResponseDtos =
				calculationAreaServiceSpy.getAreaMatrixResponseDtos(selectedPolygon,
						relevantSelectedAreaMatrices, defaultAreas, userDefinedAreas);
        assertThat(areaMatrixResponseDtos.size(), is(2));
        AreaMatrixResponse resp0 = areaMatrixResponseDtos.get(0);
        assertThat(resp0.isDefaultArea(), is(true));
        assertThat(resp0.getMatrixId(), is(1));
        assertThat(resp0.getPolygons().size(), is(1));
        assertThat(resp0.getPolygons().get(0), is(jsonToGeometry(cutAreaDefaultString))); // serialisera först
        AreaMatrixResponse resp1 = areaMatrixResponseDtos.get(1);
        assertThat(resp1.isDefaultArea(), is(false));
        assertThat(resp1.getMatrixId(), is(3));
        assertThat(resp1.getPolygons().size(), is(1));
        assertThat(resp1.getPolygons().get(0), is(jsonToGeometry(cutAreaDefaultString))); // serialisera först
    }

    @Test
    public void testGetNormalization() {
        calculationAreaService.em = mock(EntityManager.class);
        double mspMaxValue = 1.2d;

        defaultAreas.get(0).setMaxValue(mspMaxValue);
        var normalization = new NormalizationOptions(NormalizationType.DOMAIN);
        double mspNormalization = calculationAreaService.getNormalization(defaultAreas, normalization);
        assertThat(mspNormalization, is(mspMaxValue));
    }

    @Test
    public void testGetSensitivityMatrix() {

        BaselineVersion baselineVersion = new BaselineVersion();
        baselineVersion.setId(1);

        SensitivityMatrix sensitivityMatrix = new SensitivityMatrix();
        sensitivityMatrix.setId(1);

        calculationAreaService.em = mock(EntityManager.class);
        calculationAreaService.metadataService = new MetaDataService();
        calculationAreaService.metadataService.em = mock(EntityManager.class);
        when(calculationAreaService.baselineVersionService.getBaselineVersionById(1)).thenReturn(baselineVersion);
        when(calculationAreaService.em.find(SensitivityMatrix.class, 1)).thenReturn(sensitivityMatrix);

        List<SymphonyBand> pressureBands = new ArrayList<>();
        SymphonyBand pressureBand1 = new SymphonyBand();
        pressureBand1.setId(1);
        pressureBand1.setBandNumber(1);
        pressureBand1.setCategory("Pressure");
        pressureBand1.setBaseline(baselineVersion);

        SymphonyBand pressureBand2 = new SymphonyBand();
        pressureBand2.setId(2);
        pressureBand2.setBandNumber(2);
        pressureBand2.setCategory("Pressure");
        pressureBand2.setBaseline(baselineVersion);

        pressureBands.add(pressureBand1);
        pressureBands.add(pressureBand2);

        List<SymphonyBand> ecoBands = getMockedEcoBands(pressureBands, sensitivityMatrix);

        TypedQuery mockedPressuresQuery = mock(TypedQuery.class),
              mockedEcoQuery = mock(TypedQuery.class);

        when(calculationAreaService.metadataService.em.createQuery(MetaDataService.sparseBandQuery, SymphonyBand.class))
            .thenReturn(mockedPressuresQuery, mockedEcoQuery);

        when(mockedPressuresQuery.setParameter(anyString(), anyObject())).thenReturn(mockedPressuresQuery);
        when(mockedPressuresQuery.setParameter("baselineVersionId", 1)).thenReturn(mockedPressuresQuery);
        when(mockedPressuresQuery.setParameter("category", "Pressure")).thenReturn(mockedPressuresQuery);
        when(mockedPressuresQuery.getResultList()).thenReturn(pressureBands);

        when(mockedEcoQuery.setParameter(anyString(), anyObject())).thenReturn(mockedEcoQuery);
        when(mockedEcoQuery.setParameter("baselineVersionId", 1)).thenReturn(mockedEcoQuery);
        when(mockedEcoQuery.setParameter("category", "Ecosystem")).thenReturn(mockedEcoQuery);
        when(mockedEcoQuery.getResultList()).thenReturn(ecoBands);

        double[][] matrix = calculationAreaService.getSensitivityMatrix(1, baselineVersion.getId());
        assertThat(matrix[0][0], is(row1Col1Value));
        assertThat(matrix[0][1], is(row1Col2Value));
        assertThat(matrix[1][0], is(row2Col1Value));
        assertThat(matrix[1][1], is(row2Col2Value));
    }

    @Test(expected = java.lang.RuntimeException.class)
    public void testValuesSetInGetCalculationAreas() throws IOException, SymphonyStandardAppException {
        CalculationAreaService calculationAreaServiceSpy = Mockito.spy(calculationAreaService);
        ScenarioService scenarioService = mock(ScenarioService.class);
        int baselineVersionId = 1;
        List<AreaMatrixMapping> relevantSelectedAreaMatrices = new ArrayList<>();
        AreaMatrixMapping areaMatrixMapping1 = new AreaMatrixMapping(3, 2);
        relevantSelectedAreaMatrices.add(areaMatrixMapping1);
        AreaMatrixMapping areaMatrixMapping2 = new AreaMatrixMapping(4, 3);
        relevantSelectedAreaMatrices.add(areaMatrixMapping2);

        var featureJson = "{ \"type\": \"Feature\", \"geometry\": { \"type\": \"Polygon\", " +
            "\"coordinates\": [ [ [ 18.303030401845312, 61.685289442684343 ], " +
            "[ 18.303030401845312, 61.685289442684343 ], [ 18.90515925630568, 61.70801128624889 ], " +
            "[ 18.882437412741137, 62.162448157539735 ], [ 18.303030401845312, 61.685289442684343 ] ] ] }, " +
            "\"id\": \"features.3\", \"properties\": { \"name\": \"example feature\", \"title\": \"example feature\", " +
            "\"statePath\": [\"state\", \"path\"], \"changes\": {} } }";

        calculationAreaServiceSpy.em = mock(EntityManager.class);
        List<Integer> userAndDefaultAreasWithinSelectedPolygon = new ArrayList<>();
        userAndDefaultAreasWithinSelectedPolygon.add(2);
        userAndDefaultAreasWithinSelectedPolygon.add(100);

        List<CalculationArea> careasMatching = new ArrayList<>();
        CalculationArea ca1 = new CalculationArea();
        ca1.setId(1);
        ca1.setCareaDefault(true);
        careasMatching.add(ca1);
        CalculationArea ca2 = new CalculationArea();
        ca2.setId(2);
        ca2.setCareaDefault(false);
        careasMatching.add(ca2);
        CalculationArea ca3 = new CalculationArea();
        ca3.setId(3);
        ca3.setCareaDefault(false);
        careasMatching.add(ca3);

        doReturn(careasMatching)
                .when(calculationAreaServiceSpy).getCalcAreaForScenarioArea(1, baselineVersionId);

        List<AreaMatrixMapping> relAreaMatrixMappings = new ArrayList<>();
        AreaMatrixMapping adto = new AreaMatrixMapping(2, 3);
        relAreaMatrixMappings.add(adto);

        ArgumentCaptor<List> relevantSelectedAreaMatricesCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<List> defaultAreasCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<Geometry> selectedAreasCaptor2 = ArgumentCaptor.forClass(Geometry.class);
        ArgumentCaptor<List> relevantNonDefaultCalcAreasCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<Integer> baseDataVersionIdCaptor = ArgumentCaptor.forClass(Integer.class);

        doReturn(new ArrayList<>())
                .when(calculationAreaServiceSpy).getMatrixList(relevantSelectedAreaMatricesCaptor.capture()
						, defaultAreasCaptor.capture(), baseDataVersionIdCaptor.capture());

        doReturn(new ArrayList<>())
                .when(calculationAreaServiceSpy).getAreaMatrixResponseDtos(selectedAreasCaptor2.capture(),
						anyList(), anyList(), relevantNonDefaultCalcAreasCaptor.capture());

        BaselineVersion baselineVersion = new BaselineVersion();
        baselineVersion.setId(baselineVersionId);
        calculationAreaServiceSpy.baselineVersionService = mock(BaselineVersionService.class);
        doReturn(baselineVersion)
                .when(calculationAreaServiceSpy.baselineVersionService).getVersionByName("Test");
        doReturn(baselineVersion)
                .when(calculationAreaServiceSpy.baselineVersionService).getBaselineVersionById(baselineVersionId);

        var mapper = new ObjectMapper();

        var areaDto =
            new ScenarioAreaDto(1, mapper.readTree("{}"), mapper.readTree(featureJson),
                    mapper.readTree("{\"matrixType\": \"STANDARD\"}"), -1, null, null);

        var testScenario = new ScenarioDto();
        testScenario.name = "TEST-SCENARIO";
        testScenario.baselineId = baselineVersionId;
        testScenario.areas = new ScenarioAreaDto[]{ areaDto };

        var scenario = new Scenario(testScenario, scenarioService);

        calculationAreaServiceSpy.getAreaCalcMatrices(scenario);

        AreaMatrixMapping areaMatrixArg =
				(AreaMatrixMapping) relevantSelectedAreaMatricesCaptor.getAllValues().get(0).get(0);
        CalculationArea calculationAreaArg =
				(CalculationArea) defaultAreasCaptor.getAllValues().get(0).get(0);
        assertThat(areaMatrixArg.getAreaId(), is(3));
        assertThat(areaMatrixArg.getMatrixId(), is(2));
        assertThat(calculationAreaArg.getId(), is(1));
        assertThat(calculationAreaArg.isCareaDefault(), is(true));

        CalculationArea calculationAreaArg2 =
				(CalculationArea) relevantNonDefaultCalcAreasCaptor.getAllValues().get(0).get(0);
        assertThat(selectedAreasCaptor2.getAllValues().get(0), is(selectedPolygon));
        assertThat(calculationAreaArg2.getId(), is(3));
        assertThat(calculationAreaArg2.isCareaDefault(), is(false));
    }

    @Test
    public void testGetNonDefaultAreasForAreaType() {
        List<CalculationArea> calulationAreas = new ArrayList<>();
        AreaType a1 = new AreaType();
        a1.setId(1);
        AreaType a2 = new AreaType();
        a2.setId(2);
        CalculationArea ca = new CalculationArea();
        ca.setAreaType(a1);
        ca.setName("a1");
        ca.setCareaDefault(true);
        calulationAreas.add(ca);
        ca = new CalculationArea();
        ca.setAreaType(a1);
        ca.setName("a2");
        ca.setCareaDefault(false);
        calulationAreas.add(ca);
        ca = new CalculationArea();
        ca.setAreaType(a2);
        ca.setName("a3");
        ca.setCareaDefault(false);
        calulationAreas.add(ca);
        List<CalculationArea> resp = calculationAreaService.getNonDefaultAreasForAreaType(1, calulationAreas);
        assertThat(resp.size(), is(1));
        assertThat(resp.get(0).getAreaType().getId(), is(1));
        assertThat(resp.get(0).getName(), is("a2"));
    }

    private Geometry jsonToGeometry(String geoJSON) throws SymphonyStandardAppException {
        GeometryJSON g = new GeometryJSON();
        Geometry geometry = null;
        try {
            geometry = g.read(geoJSON);
        } catch (IOException e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.GEOJSON_TO_GEOMETRY_CONVERSION_ERROR);
        }
        return geometry;
    }


    /**
     * Get the list of ecosystem metadata. Each ecosystem metadata is connected to pressure metadata in the
     * sensitivity matrix.
     *
     * @return List of ecosystem metadata with sensitivity values
     */
    private List<SymphonyBand> getMockedEcoBands(List<SymphonyBand> pressuresList,
                                                 SensitivityMatrix sensitivityMatrix) {
            List<SymphonyBand> ecoBands = new ArrayList<>();

            SymphonyBand ecoBand1 = new SymphonyBand();
            ecoBand1.setId(1);
            ecoBand1.setBandNumber(1);
            ecoBand1.setCategory("Ecosystem");
            ecoBand1.setEcoSensitivities(new HashSet<>());

            SymphonyBand ecoBand2 = new SymphonyBand();
            ecoBand2.setId(2);
            ecoBand2.setBandNumber(2);
            ecoBand2.setCategory("Ecosystem");
            ecoBand2.setEcoSensitivities(new HashSet<>());

            Sensitivity ecoSensitivity11 = new Sensitivity();
            ecoSensitivity11.setMatrix(sensitivityMatrix);
            ecoSensitivity11.setEcoBand(ecoBand1);
            ecoSensitivity11.setPressureBand(pressuresList.get(0));
            ecoSensitivity11.setValue(BigDecimal.valueOf(row1Col1Value));

            Sensitivity ecoSensitivity21 = new Sensitivity();
            ecoSensitivity21.setMatrix(sensitivityMatrix);
            ecoSensitivity21.setEcoBand(ecoBand1);
            ecoSensitivity21.setPressureBand(pressuresList.get(1));
            ecoSensitivity21.setValue(BigDecimal.valueOf(row2Col1Value));

            Sensitivity ecoSensitivity12 = new Sensitivity();
            ecoSensitivity12.setMatrix(sensitivityMatrix);
            ecoSensitivity12.setEcoBand(ecoBand2);
            ecoSensitivity12.setPressureBand(pressuresList.get(0));
            ecoSensitivity12.setValue(BigDecimal.valueOf(row1Col2Value));

            Sensitivity ecoSensitivity22 = new Sensitivity();
            ecoSensitivity22.setMatrix(sensitivityMatrix);
            ecoSensitivity22.setEcoBand(ecoBand2);
            ecoSensitivity22.setPressureBand(pressuresList.get(1));
            ecoSensitivity22.setValue(BigDecimal.valueOf(row2Col2Value));

            ecoBand1.getEcoSensitivities().add(ecoSensitivity11);
            ecoBand1.getEcoSensitivities().add(ecoSensitivity21);
            ecoBand2.getEcoSensitivities().add(ecoSensitivity12);
            ecoBand2.getEcoSensitivities().add(ecoSensitivity22);

            ecoBands.add(ecoBand1);
            ecoBands.add(ecoBand2);

        return ecoBands;
    }
}
