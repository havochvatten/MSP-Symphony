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
import se.havochvatten.symphony.scenario.Scenario;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.io.IOException;
import java.math.BigDecimal;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.mockito.Matchers.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

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

        // Selected area
        //selectedPolygon = jsonToGeometry("[p1]");
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

        Mockito.doReturn(cutAreasDefault)
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
    public void testGetNormalization() throws SymphonyStandardAppException {
        calculationAreaService.em = mock(EntityManager.class);
        double mspMaxValue = 1.2d;

        defaultAreas.get(0).setMaxValue(mspMaxValue);
        var normalization = new NormalizationOptions(NormalizationType.DOMAIN);
        double mspNormalization = calculationAreaService.getNormalization(defaultAreas, normalization);
        assertThat(mspNormalization, is(mspMaxValue));
    }

    @Test
    public void testGetSensitivityMatrix() throws SymphonyStandardAppException {
        SensitivityMatrix sensitivityMatrix = new SensitivityMatrix();
        sensitivityMatrix.setId(1);

        List<Metadata> metadataPressList = new ArrayList<>();
        Metadata metaPres1 = new Metadata();
        metaPres1.setId(1);
        metaPres1.setBandNumber(1);
        metadataPressList.add(metaPres1);
        Metadata metaPres2 = new Metadata();
        metaPres2.setId(2);
        metaPres2.setBandNumber(2);
        metadataPressList.add(metaPres2);

        List<Metadata> metadataEcoList = getMockedEcoMetadata(metadataPressList, sensitivityMatrix);

        calculationAreaService.em = mock(EntityManager.class);

        when(calculationAreaService.em.find(SensitivityMatrix.class, 1)).thenReturn(new SensitivityMatrix());

        BaselineVersion baselineVersion = new BaselineVersion();
        baselineVersion.setId(1);
        when(calculationAreaService.baselineVersionService.getBaselineVersionByDate(any())).thenReturn(baselineVersion);

        Query mockedQuery = mock(Query.class);
        when(calculationAreaService.em.createQuery("SELECT mp FROM Metadata mp WHERE mp.symphonyCategory = " +
				":category AND mp.baselineVersion.id = :versionid ORDER BY mp.bandNumber ASC")).thenReturn(mockedQuery);
        when(mockedQuery.setParameter(eq("category"), eq("Pressure"))).thenReturn(mockedQuery);
        when(mockedQuery.setParameter(eq("versionid"), eq(baselineVersion.getId()))).thenReturn(mockedQuery);
        when(mockedQuery.getResultList()).thenReturn(metadataPressList);

        Query mockedQuery2 = mock(Query.class);
        when(calculationAreaService.em.createQuery("SELECT me FROM Metadata me WHERE me.symphonyCategory = " +
				":category AND me.baselineVersion.id = :versionid ORDER BY me.bandNumber ASC")).thenReturn(mockedQuery2);
        when(mockedQuery2.setParameter(eq("category"), eq("Ecosystem"))).thenReturn(mockedQuery2);
        when(mockedQuery2.setParameter(eq("versionid"), eq(baselineVersion.getId()))).thenReturn(mockedQuery2);
        when(mockedQuery2.getResultList()).thenReturn(metadataEcoList);

        double[][] matrix = calculationAreaService.getSensitivityMatrix(1, baselineVersion.getId());
        assertThat(matrix[0][0], is(row1Col1Value));
        assertThat(matrix[0][1], is(row1Col2Value));
        assertThat(matrix[1][0], is(row2Col1Value));
        assertThat(matrix[1][1], is(row2Col2Value));
    }

    @Test(expected = java.lang.RuntimeException.class)
    public void testValuesSetInGetCalculationAreas() throws IOException, SymphonyStandardAppException {
        CalculationAreaService calculationAreaServiceSpy = Mockito.spy(calculationAreaService);
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

        Mockito.doReturn(careasMatching)
                .when(calculationAreaServiceSpy).getAreasWithinPolygon(selectedPolygon, baselineVersionId);

        List<AreaMatrixMapping> relAreaMatrixMappings = new ArrayList<>();
        AreaMatrixMapping adto = new AreaMatrixMapping(2, 3);
        relAreaMatrixMappings.add(adto);

        ArgumentCaptor<List> relevantSelectedAreaMatricesCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<List> defaultAreasCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<Geometry> selectedAreasCaptor2 = ArgumentCaptor.forClass(Geometry.class);
        ArgumentCaptor<List> relevantNonDefaultCalcAreasCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<Integer> baseDataVersionIdCaptor = ArgumentCaptor.forClass(Integer.class);

        Mockito.doReturn(new ArrayList<>())
                .when(calculationAreaServiceSpy).getMatrixList(relevantSelectedAreaMatricesCaptor.capture()
						, defaultAreasCaptor.capture(), baseDataVersionIdCaptor.capture());

        Mockito.doReturn(new ArrayList<>())
                .when(calculationAreaServiceSpy).getAreaMatrixResponseDtos(selectedAreasCaptor2.capture(),
						anyList(), anyList(), relevantNonDefaultCalcAreasCaptor.capture());

        BaselineVersion baselineVersion = new BaselineVersion();
        baselineVersion.setId(baselineVersionId);
        calculationAreaServiceSpy.baselineVersionService = mock(BaselineVersionService.class);
        Mockito.doReturn(baselineVersion)
                .when(calculationAreaServiceSpy.baselineVersionService).getVersionByName("Test");
        Mockito.doReturn(baselineVersion)
                .when(calculationAreaServiceSpy.baselineVersionService).getBaselineVersionById(baselineVersionId);

        var mapper = new ObjectMapper();

        var areaDto =
            new ScenarioAreaDto(1, mapper.readTree("{}"), mapper.readTree(featureJson),
                    mapper.readTree("{\"matrixType\": \"STANDARD\"}"), -1, null);

        var testScenario = new ScenarioDto();
        testScenario.name = "TEST-SCENARIO";
        testScenario.baselineId = baselineVersionId;
        testScenario.areas = new ScenarioAreaDto[]{ areaDto };

        var scenario = new Scenario(testScenario);

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
    public void testGetNonDefaultAreasForAreaType() throws SymphonyStandardAppException {
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
    private List<Metadata> getMockedEcoMetadata(List<Metadata> metadataPressList,
												SensitivityMatrix sensitivityMatrix) {
        List<Metadata> metadataEcoList = new ArrayList();

        // Firs eco metadata connected to the pressures
        Metadata metadataEco1 = new Metadata();
        metadataEco1.setBandNumber(1);
        List<Sensitivity> ecoSensList1 = new ArrayList<>();
        Sensitivity ecoSens11 = new Sensitivity();
        ecoSens11.setPresMetadata(metadataPressList.get(0));
        ecoSens11.setValue(BigDecimal.valueOf(row1Col1Value));
        ecoSens11.setSensitivityMatrix(sensitivityMatrix);
        ecoSensList1.add(ecoSens11);
        Sensitivity ecoSens21 = new Sensitivity();
        ecoSens21.setPresMetadata(metadataPressList.get(1));
        ecoSens21.setValue(BigDecimal.valueOf(row2Col1Value));
        ecoSens21.setSensitivityMatrix(sensitivityMatrix);
        ecoSensList1.add(ecoSens21);
        metadataEco1.setEcoSensitivities(ecoSensList1);
        metadataEcoList.add(metadataEco1);

        // Second eco metadata connected to the pressures
        Metadata metadataEco2 = new Metadata();
        metadataEco2.setBandNumber(2);
        List<Sensitivity> ecoSensList2 = new ArrayList<>();
        Sensitivity ecoSens12 = new Sensitivity();
        ecoSens12.setPresMetadata(metadataPressList.get(0));
        ecoSens12.setValue(BigDecimal.valueOf(row1Col2Value));
        ecoSens12.setSensitivityMatrix(sensitivityMatrix);
        ecoSensList2.add(ecoSens12);
        Sensitivity ecoSens22 = new Sensitivity();
        ecoSens22.setPresMetadata(metadataPressList.get(1));
        ecoSens22.setValue(BigDecimal.valueOf(row2Col2Value));
        ecoSens22.setSensitivityMatrix(sensitivityMatrix);
        ecoSensList2.add(ecoSens22);
        metadataEco2.setEcoSensitivities(ecoSensList2);
        metadataEcoList.add(metadataEco2);

        return metadataEcoList;
    }

    @Test
    public void testAreaSelect() throws SymphonyStandardAppException {
//        calculationAreaService.calcAreaSensMatrixService = mock(CalcAreaSensMatrixService.class);
//        CalculationAreaService calculationAreaServiceSpy = Mockito.spy(calculationAreaService);
//        String baselineName = "TESTBASELINE";
//        CalcAreaSensMatrix calcAreaSensMatrix = new CalcAreaSensMatrix();
//        SensitivityMatrix sensitivityMatrix = new SensitivityMatrix();
//        sensitivityMatrix.setId(11);
//        sensitivityMatrix.setName("sensitivityMatrix1");
//        calcAreaSensMatrix.setSensitivityMatrix(sensitivityMatrix);
//        List<CalcAreaSensMatrix> calcAreaSensMatrices = new ArrayList<>();
//        calcAreaSensMatrices.add(calcAreaSensMatrix);
//
//        BaselineVersion baselineVersion = new BaselineVersion();
//        baselineVersion.setId(1);
//        baselineVersion.setName(baselineName);
//
//        AreaType a1 = new AreaType();
//        a1.setId(1);
//
//        SensitivityMatrix defaultSensMatrix = new SensitivityMatrix();
//        defaultSensMatrix.setId(123);
//        defaultSensMatrix.setName("defaultSensMatrix");
//
//        List<CalculationArea> careasMatching = new ArrayList<>();
//        CalculationArea ca1 = new CalculationArea();
//        ca1.setId(1);
//        ca1.setName("MSP1");
//        ca1.setCareaDefault(true);
//        ca1.setdefaultSensitivityMatrix(defaultSensMatrix);
//        ca1.setAreaType(a1);
//        ca1.setCalcAreaSensMatrixList(calcAreaSensMatrices);
//        careasMatching.add(ca1);
//        CalculationArea ca2 = new CalculationArea();
//        ca2.setId(2);
//        ca2.setCareaDefault(false);
//        ca2.setAreaType(a1);
//        ca2.setdefaultSensitivityMatrix(sensitivityMatrix);
//        ca2.setCalcAreaSensMatrixList(calcAreaSensMatrices);
//        careasMatching.add(ca2);
//        CalculationArea ca3 = new CalculationArea();
//        ca3.setId(3);
//        ca3.setCareaDefault(false);
//        ca3.setAreaType(a1);
//        ca3.setCalcAreaSensMatrixList(calcAreaSensMatrices);
//        careasMatching.add(ca3);
//
//
//        List<CalcAreaSensMatrix> userDefinedCAMatrices = new ArrayList<>();
//        CalcAreaSensMatrix userDefinedCAMatrix = new CalcAreaSensMatrix();
//        SensitivityMatrix userDefMatrix = new SensitivityMatrix();
//        userDefMatrix.setId(111);
//        userDefMatrix.setName("userDefMatrix1");
//        userDefinedCAMatrix.setSensitivityMatrix(userDefMatrix);
//        userDefinedCAMatrices.add(userDefinedCAMatrix);
//
//        String selectedPoly = "{ \"type\": \"Polygon\", \"coordinates\": [ [ [ 18.303030401845312, 61.685289442684343 ], [ 18.303030401845312, 61.685289442684343 ]," +
//                "[ 18.90515925630568, 61.70801128624889 ], [ 18.882437412741137, 62.162448157539735 ], [ 18.303030401845312, 61.685289442684343 ] ] ] }";
//        Principal mockPrincipal = mock(Principal.class);
//        when(mockPrincipal.getName()).thenReturn("Tester");
//        Mockito.doReturn(careasMatching)
//                .when(calculationAreaServiceSpy).getAreasWithinPolygon(selectedPolygon, 1);
//        when(calculationAreaServiceSpy.baselineVersionService.getVersionByName(baselineName)).thenReturn(baselineVersion);
//        when(calculationAreaServiceSpy.calcAreaSensMatrixService.findByBaselineAndOwnerAndArea(baselineName, mockPrincipal, 1)).thenReturn(userDefinedCAMatrices);
//
//        AreaSelectionResponseDto resp = calculationAreaServiceSpy.areaSelect(baselineName, selectedPoly, mockPrincipal);
//        assertThat(resp.getAreaTypes().size(), is(1));
//        assertThat(resp.getAreaTypes().get(0).getAreas().size(), is(2));
//        assertThat(resp.getAreaTypes().get(0).getAreas().get(0).getDefaultMatrix().getId(), is(11));
//        assertThat(resp.getAreaTypes().get(0).getAreas().get(0).getMatrices().size(), is(1));
//        assertThat(resp.getDefaultArea().getId(), is(1));
//        assertThat(resp.getDefaultArea().getName(), is("MSP1"));
//        assertThat(resp.getDefaultArea().getUserDefinedMatrices().size(), is(1));
//        assertThat(resp.getDefaultArea().getUserDefinedMatrices().get(0).getId(), is(111));
//        assertThat(resp.getDefaultArea().getUserDefinedMatrices().get(0).getName(), is("userDefMatrix1"));
//        assertThat(resp.getDefaultArea().getDefaultMatrix().getId(), is(123));
//        assertThat(resp.getDefaultArea().getDefaultMatrix().getName(), is("defaultSensMatrix"));
    }
}
