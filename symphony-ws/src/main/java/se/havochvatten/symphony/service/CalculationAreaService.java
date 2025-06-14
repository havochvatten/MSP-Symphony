package se.havochvatten.symphony.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import org.geotools.geojson.geom.GeometryJSON;
import org.locationtech.jts.geom.Geometry;
import se.havochvatten.symphony.dto.SensitivityMatrix;
import se.havochvatten.symphony.dto.*;
import se.havochvatten.symphony.entity.*;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.mapper.AreaSelectionResponseDtoMapper;
import se.havochvatten.symphony.dto.AreaSelectionResponseDto.AreaOverlapFragment;
import se.havochvatten.symphony.mapper.CalculationAreaMapper;
import se.havochvatten.symphony.entity.Scenario;
import se.havochvatten.symphony.entity.ScenarioArea;

import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.io.IOException;
import java.security.Principal;
import java.util.*;

import static se.havochvatten.symphony.mapper.AreaSelectionResponseDtoMapper.mapSensitivityMatrixToDto;
import static se.havochvatten.symphony.util.CalculationUtil.jsonListToGeometryList;
import static se.havochvatten.symphony.util.CalculationUtil.jsonToGeometry;

@Stateless
public class CalculationAreaService {
    private static final ObjectMapper mapper = new ObjectMapper();

    @PersistenceContext(unitName = "symphonyPU")
    public EntityManager em;

    @EJB
    BaselineVersionService baselineVersionService;

    @EJB
    CalcAreaSensMatrixService calcAreaSensMatrixService;

    @EJB
    MetaDataService metadataService;

    /**
     * @return All CalculationAreas defined in the system (areas meant to be used in calculations)
     */
    public List<CalculationArea> findCalculationAreas(String baselineName) {
        return em.createNamedQuery("CalculationArea.findByBaselineName", CalculationArea.class)
                .setParameter("name", baselineName)
                .getResultList();
    }

    public List<CalculationArea> findCalibratedCalculationAreas(String baselineName) {
        return em.createNamedQuery("CalculationArea.findCalibratedByBaselineName", CalculationArea.class)
                .setParameter("name", baselineName)
                .getResultList();
    }

    public List<CalculationArea> findCalculationAreas(List<Integer> ids) {
        return em.createNamedQuery("CalculationArea.findByIds", CalculationArea.class)
                .setParameter("ids", ids)
                .getResultList();
    }

    public CalculationArea findCalculationArea(Integer id) {
        return em.find(CalculationArea.class, id);
    }

    public List<MatrixSelection> findAvailableMatricesForUser(String baselineName, Principal principal) {
        return em.createNamedQuery("SensitivityMatrix.findAllByBaselineNameAndOwner", MatrixSelection.class)
                .setParameter("name", baselineName)
                .setParameter("owner", principal.getName())
                .getResultList();
    }

    /**
     * @return AreaSelectionResponseDto with information to frontend about Area tyes, areas and sensitivity
     * matrices for selection/input to calculation
     */
    public AreaSelectionResponseDto areaSelect(String baselineName, int areaId, Principal principal)
            throws SymphonyStandardAppException {
        try {
            ScenarioArea scenarioArea = em.find(ScenarioArea.class, areaId);
            Geometry geoRoi = scenarioArea.getGeometry();
            BaselineVersion baselineVersion = baselineVersionService.getVersionByName(baselineName);
            List<CalculationArea> calcAreasWithinRoi = getCalcAreaForScenarioArea(areaId, baselineVersion.getId());

            List<CalculationArea> defaultAreas = calcAreasWithinRoi
                .stream()
                .filter(CalculationArea::isCareaDefault)
                .toList();

            if(defaultAreas.isEmpty()) {
                return new AreaSelectionResponseDto(){{
                    setAlternativeMatrices(findAvailableMatricesForUser(baselineName, principal));
                }};
            }

            if(defaultAreas.size() > 1) {
                GeometryJSON geoJson = new GeometryJSON(7);
                ObjectMapper fragmentMapper = new JsonMapper();
                List<AreaOverlapFragment> fragmentMap = new ArrayList<>();

                for(CalculationArea dca : defaultAreas) {
                    List<String> daPolygons = dca.getCaPolygonList()
                        .stream().map(CaPolygon::getPolygon).toList();
                    for (String dapStr : daPolygons) {
                        Geometry daPolygon = jsonToGeometry(dapStr);
                        if (daPolygon.intersects(geoRoi)) {
                            var defMatrixFragment = new AreaOverlapFragment();
                            defMatrixFragment.setPolygon(fragmentMapper.readTree(geoJson.toString(geoRoi.intersection(daPolygon))));
                            defMatrixFragment.setDefaultMatrix(mapSensitivityMatrixToDto(dca.getDefaultSensitivityMatrix()));
                            fragmentMap.add(defMatrixFragment);
                        }
                    }
                }
                return new AreaSelectionResponseDto(){{
                    setOverlap(fragmentMap);
                }};
            } else {
                CalculationArea defaultArea = defaultAreas.get(0);
                List<AreaType> areaTypes = getAreaTypes(calcAreasWithinRoi);
                List<AreaSelectionResponseDto.AreaTypeArea> areaTypeDtos = new ArrayList<>();
                for (AreaType aType : areaTypes) {
                    List<CalculationArea> calculationAreas = getNonDefaultAreasForAreaType(aType.getId(),
                        calcAreasWithinRoi);
                    AreaSelectionResponseDto.AreaTypeArea areaTypeDto =
                        AreaSelectionResponseDtoMapper.mapToAreaTypeDto(aType, calculationAreas);
                    areaTypeDtos.add(areaTypeDto);
                }
                List<CalcAreaSensMatrix> userDefinedMatrices =
                    calcAreaSensMatrixService.findByBaselineAndOwnerAndArea(baselineVersion.getName(),
                        principal, defaultArea.getId());
                List<CalcAreaSensMatrix> commonBaselineMatrices =
                    calcAreaSensMatrixService.findByBaselineAndArea(baselineVersion.getName(), defaultArea.getId());
                commonBaselineMatrices.removeIf(m -> m.getSensitivityMatrix().getId().equals(defaultArea.getDefaultSensitivityMatrix().getId()));
                return AreaSelectionResponseDtoMapper.mapToDto(defaultArea,
                    areaTypeDtos, userDefinedMatrices, commonBaselineMatrices);
            }
        } catch (IOException e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.MAPPING_OBJECT_TO_POLYGON_STRING_ERROR);
        }
    }

    public ScenarioAreaSelectionResponseDto scenarioAreaSelect(String baselineName, int scenarioId, Principal principal) throws SymphonyStandardAppException {
        Scenario scenario = em.find(Scenario.class, scenarioId);

        int[] areaIds = scenario.getAreas().stream().mapToInt(ScenarioArea::getId).toArray();
        ScenarioAreaSelectionResponseDto resp = new ScenarioAreaSelectionResponseDto();

        for(Integer areaId : areaIds) {
            try {
                resp.matrixData.put(areaId, areaSelect(baselineName, areaId, principal));
            } catch (SymphonyStandardAppException e) {
                if(e.getErrorCode() == SymphonyModelErrorCode.NO_DEFAULT_MATRIX_FOUND) {
                    resp.matrixData.put(areaId, new AreaSelectionResponseDto());
                } else {
                    throw e;
                }
            }
            resp.matrixData.put(areaId, areaSelect(baselineName, areaId, principal));
        }

        return resp;
    }


    /**
     * @return CalculationAreaDto having id
     */
    public CalculationAreaDto get(Integer id) throws SymphonyStandardAppException {
        CalculationArea calculationArea = em.find(CalculationArea.class, id);
        if (calculationArea == null) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.CALCULATION_AREA_NOT_FOUND);
        }
        return CalculationAreaMapper.mapToDto(calculationArea);
    }

    /**
     * Create a CalculationAreaDto
     *
     * @return calculationAreaDto
     */
    public CalculationAreaDto create(CalculationAreaDto calculationAreaDto) throws SymphonyStandardAppException {
        Integer defaultSensMatrixId = calculationAreaDto.getDefaultSensitivityMatrixId();
        se.havochvatten.symphony.entity.SensitivityMatrix sensitivityMatrix =
                em.find(se.havochvatten.symphony.entity.SensitivityMatrix.class, defaultSensMatrixId);
        if (defaultSensMatrixId != null && !defaultSensMatrixId.equals(0) && sensitivityMatrix == null) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.SENSITIVITY_MATRIX_NOT_FOUND);
        }
        CalculationArea calculationArea = CalculationAreaMapper.mapToEntity(calculationAreaDto,
                sensitivityMatrix);
        calculationArea.setId(null);
        em.persist(calculationArea);
        return CalculationAreaMapper.mapToDto(calculationArea);
    }

    /**
     * Update calculation area
     *
     * @return Updated CalculationAreaDto
     */
    public CalculationAreaDto update(CalculationAreaDto calculationAreaDto) throws SymphonyStandardAppException {
        se.havochvatten.symphony.entity.SensitivityMatrix sensitivityMatrix = null;
        Integer defaultSensMatrixId = calculationAreaDto.getDefaultSensitivityMatrixId();
        if (defaultSensMatrixId != null && !defaultSensMatrixId.equals(0)) {
            sensitivityMatrix = em.find(se.havochvatten.symphony.entity.SensitivityMatrix.class,
                    defaultSensMatrixId);
        }
        if (defaultSensMatrixId != null && !defaultSensMatrixId.equals(0) && sensitivityMatrix == null) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.SENSITIVITY_MATRIX_NOT_FOUND);
        }
        CalculationArea calculationArea = CalculationAreaMapper.mapToEntity(calculationAreaDto,
                sensitivityMatrix);
        calculationArea = em.merge(calculationArea);
        return CalculationAreaMapper.mapToDto(calculationArea);
    }


    /**
     * Delete CalculationArea with the given id
     */
    public void delete(Integer id) throws SymphonyStandardAppException {
        CalculationArea calculationArea = em.find(CalculationArea.class, id);
        if (calculationArea == null) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.CALCULATION_AREA_NOT_FOUND);
        }
        em.remove(calculationArea);
    }

    public MatrixResponse getAreaCalcMatrices(Scenario scenario) throws SymphonyStandardAppException {
        // Explicit fetch join bringing lazy-loaded customCalcArea into session
        TypedQuery<ScenarioArea> query = em.createQuery("SELECT area FROM ScenarioArea area LEFT JOIN FETCH area.customCalcArea WHERE area.id IN :ids", ScenarioArea.class);
        query.setParameter("ids", scenario.getAreas().stream().mapToInt(ScenarioArea::getId).boxed().toList());
        List<ScenarioArea> j_areas = query.getResultList();

        return getAreaCalcMatrices(j_areas, scenario.getBaselineId());
    }

    public MatrixResponse getAreaCalcMatrices(List<ScenarioArea> areas, Integer baselineId) throws SymphonyStandardAppException {

        Integer areaId, defaultSensMatrixId = null;
        CalculationArea calculationArea;
        MatrixResponse areaMatrixMap = new MatrixResponse(areas.stream().mapToInt(ScenarioArea::getId).toArray());

        BaselineVersion baseline = baselineVersionService.getBaselineVersionById(baselineId);
        List<CaPolygon> defaultCalcAreaPolygons = getDefaultCalcAreaPolygonsForBaseline(baseline.getId());

        for(ScenarioArea area : areas) {
            areaId = area.getId();
            var areaMatrixParameters = area.getMatrixParameters();
            for(CaPolygon defaultAreaPoly : defaultCalcAreaPolygons){
                if (jsonToGeometry(defaultAreaPoly.getPolygon()).intersects(area.getGeometry())) {
                    calculationArea = defaultAreaPoly.getCalculationArea();
                    defaultSensMatrixId = calculationArea.getDefaultSensitivityMatrix().getId();
                    areaMatrixMap.setAreaNormalizationValue(areaId, defaultAreaPoly.getCalculationArea().getMaxValue());
                    break;
                }
            }

            CalculationArea customCalcArea = area.getCustomCalcArea();

            if (customCalcArea != null) {
                areaMatrixMap.setAreaNormalizationValue(areaId, customCalcArea.getMaxValue());
            }

            if(areaMatrixParameters.getMatrixId() != null) {
                areaMatrixMap.setAreaMatrixId(areaId, areaMatrixParameters.getMatrixId());
            } else {
                if (areaMatrixParameters.getMatrixType() == MatrixParameters.MatrixType.STANDARD && defaultSensMatrixId != null) {
                    areaMatrixMap.setAreaMatrixId(areaId, defaultSensMatrixId);
                } else {
                    throw new SymphonyStandardAppException(SymphonyModelErrorCode.MATRIX_NOT_SET);
                }
            }
        }

        return areaMatrixMap;

    }

    private List<CaPolygon> getDefaultCalcAreaPolygonsForBaseline(Integer id) {
        return em.createNamedQuery("CaPolygon.findDefaultForBaselineVersionId", CaPolygon.class)
                    .setParameter("versionId", id)
                    .getResultList();
    }

    /**
     * @return calculation areas matching the scenario area
     */
    List<CalculationArea> getCalcAreaForScenarioArea(int scenarioAreaId, int baselineVersionId) {
        return em.createNamedQuery("CalculationArea.findByScenarioArea", CalculationArea.class)
                .setParameter("scenarioAreaId", scenarioAreaId)
                .setParameter("versionId", baselineVersionId)
                .getResultList();
    }

    /**
     * @return Normalization MaxValue for NormalizationType (national for country, msp for defaultArea)
     */
    double getNormalization(List<CalculationArea> defaultAreas, NormalizationOptions normalization) {
        double maxValue = 0;
        switch (normalization.getType()) {
            case DOMAIN:
                Optional<CalculationArea> caOpt =
                        defaultAreas.stream().filter(CalculationArea::isCareaDefault).findFirst();
                if (caOpt.isPresent())
                    maxValue = caOpt.get().getMaxValue() == null ? 0 : caOpt.get().getMaxValue();
                break;
            case STANDARD_DEVIATION:
                maxValue = normalization.getStdDevMultiplier();
                break;
            case USER_DEFINED:
                maxValue = normalization.getUserDefinedValue();
                break;
            case AREA, PERCENTILE:
                /* do nothing at this stage */
        }
        return maxValue;
    }

    /**
     * @return The AreaMatrixResponseDtos with polygons and reference to sensitivity matrix id.
     * @throws SymphonyStandardAppException
     */
    List<AreaMatrixResponse> getAreaMatrixResponseDtos(Geometry selectedPolygon,
                                                       List<AreaMatrixMapping> relevantSelectedAreaMatrices,
                                                       List<CalculationArea> defaultAreas,
                                                       List<CalculationArea> relevantNonDefaultCalcAreas)
            throws SymphonyStandardAppException {
        List<AreaMatrixResponse> areaMatrixResponseDtos = new ArrayList<>();

        for (CalculationArea defaultArea : defaultAreas) {
            AreaMatrixResponse areaMatrixResponseDto = new AreaMatrixResponse();
            areaMatrixResponseDto.setDefaultArea(true);
            areaMatrixResponseDto.setMatrixId(defaultArea.getDefaultSensitivityMatrix() == null ? null :
                    defaultArea.getDefaultSensitivityMatrix().getId());
            List<String> polygons =
                    defaultArea.getCaPolygonList().stream().map(CaPolygon::getPolygon).toList();
            areaMatrixResponseDto.getPolygons().addAll(withinSelectedPolygon(selectedPolygon, polygons));
            areaMatrixResponseDtos.add(areaMatrixResponseDto);
        }

        for (CalculationArea nonDefaultArea : relevantNonDefaultCalcAreas) {
            AreaMatrixResponse areaMatrixResponseDto = new AreaMatrixResponse();
            Optional<AreaMatrixMapping> opt =
                    relevantSelectedAreaMatrices.stream().filter(a -> a.getAreaId().equals(nonDefaultArea.getId())).findFirst();
            Integer matrixId = null;
            if (opt.isPresent()) {
                matrixId = opt.get().getMatrixId();
            }
            areaMatrixResponseDto.setMatrixId(matrixId);
            List<String> polygons =
                    nonDefaultArea.getCaPolygonList().stream().map(CaPolygon::getPolygon).toList();
            areaMatrixResponseDto.getPolygons().addAll(withinSelectedPolygon(selectedPolygon, polygons));
            areaMatrixResponseDtos.add(areaMatrixResponseDto);
        }
        return areaMatrixResponseDtos;
    }

    /**
     * @return The matrices referenced by the areas in the service response (MatrixResponse).
     */
    List<SensitivityMatrix> getMatrixList(List<AreaMatrixMapping> relevantSelectedAreaMatrices,
                                          List<CalculationArea> defaultAreas, Integer baseDataVersionId) {
        Set<SensitivityMatrix> sensitivityMatrices = new HashSet<>();

        for (CalculationArea defaultArea : defaultAreas) {
            SensitivityMatrix sensitivityMatrix =
                    new SensitivityMatrix(defaultArea.getDefaultSensitivityMatrix().getId(),
                            getSensitivityMatrix(defaultArea.getDefaultSensitivityMatrix().getId(),
                                    baseDataVersionId));
            sensitivityMatrices.add(sensitivityMatrix);
        }

        for (AreaMatrixMapping selectedArea : relevantSelectedAreaMatrices) {
            SensitivityMatrix sensitivityMatrix = new SensitivityMatrix(selectedArea.getMatrixId(),
                    getSensitivityMatrix(selectedArea.getMatrixId(), baseDataVersionId));
            sensitivityMatrices.add(sensitivityMatrix);
        }

        return new ArrayList<>(sensitivityMatrices);
    }

    /**
     * @return The array of sensitivity values for the matrix with matrixId. Ordered by band number in
     * metadata for pressures (vertically) and eco components (horizontally)
     */
    public double[][] getSensitivityMatrix(Integer matrixId, int baseDataVersionId) {
        if (em.find(se.havochvatten.symphony.entity.SensitivityMatrix.class, matrixId) == null) {
            return new double[][]{};
        }

        List<SymphonyBand> pressuresList =
            metadataService.getBandsForBaselineComponent("Pressure", baseDataVersionId, true)
                .stream().sorted(Comparator.comparingInt(SymphonyBand::getBandNumber)).toList();
        List<SymphonyBand> ecosystemsList =
            metadataService.getBandsForBaselineComponent("Ecosystem", baseDataVersionId, true)
                .stream().sorted(Comparator.comparingInt(SymphonyBand::getBandNumber)).toList();

        double[][] matrix = new double[pressuresList.size()][ecosystemsList.size()];

        for (int i = 0; i < pressuresList.size(); i++) {
            double[] sensRow = getSensValueRow(matrixId, pressuresList.get(i).getId(), ecosystemsList);
            matrix[i] = sensRow;
        }

        return matrix;
    }

    /**
     * @return A row of sensitivity values in the matrix. The ecocomponents connected to pressure. Ordered by
     * band number in metadata,
     */
    private double[] getSensValueRow(Integer matrixId, Integer presId, List<SymphonyBand> ecoBandsList) {
        double[] sensRow = new double[ecoBandsList.size()];
        for (int j = 0; j < sensRow.length; j++) {
            Optional<Sensitivity> optSens =

                    ecoBandsList.get(j).getEcoSensitivities()
                            .stream()
                            .filter(e -> e.getMatrix().getId().equals(matrixId) &&
                                            e.getPressureBand().getId().equals(presId))
                            .findAny();
            sensRow[j] = optSens.isPresent() ? optSens.get().getValue().doubleValue() : Double.NaN; // Encode
            // absence of value using NaN
        }
        return sensRow;
    }

    public List<Geometry> withinSelectedPolygon(Geometry selectedPolygon, List<String> polygons) throws SymphonyStandardAppException {
        List<Geometry> geoPolygons = jsonListToGeometryList(polygons);
        return geoPolygons.stream().map(selectedPolygon::intersection).toList();
    }

    public void updateMaximumValue(int areaId, double value) {
        var area = em.find(CalculationArea.class, areaId);
        area.setMaxValue(value);
        em.merge(area);
    }

    /**
     * Get distinct List<AreaType> from calculationareas
     *
     * @return Area Types
     */
    private List<AreaType> getAreaTypes(List<CalculationArea> calulationAreas) {
        return calulationAreas.stream().filter(ca -> !ca.isCareaDefault() && ca.getAreaType() != null)
                                        .map(CalculationArea::getAreaType).distinct().toList();
    }

    /**
     * @return Alist of calculation areas with requested areaType from the given calulationAreas
     */
    List<CalculationArea> getNonDefaultAreasForAreaType(Integer areaTypeId,
                                                        List<CalculationArea> calulationAreas) {
        return calulationAreas.stream().filter(ca -> !ca.isCareaDefault() && ca.getAreaType() != null && ca.getAreaType().getId().equals(areaTypeId)).toList();
    }
}

