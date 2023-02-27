package se.havochvatten.symphony.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import org.geotools.geojson.geom.GeometryJSON;
import org.locationtech.jts.geom.Geometry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.dto.SensitivityMatrix;
import se.havochvatten.symphony.dto.*;
import se.havochvatten.symphony.entity.*;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.mapper.AreaSelectionResponseDtoMapper;
import se.havochvatten.symphony.dto.AreaSelectionResponseDto.AreaOverlapFragment;
import se.havochvatten.symphony.mapper.CalculationAreaMapper;
import se.havochvatten.symphony.scenario.Scenario;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.io.IOException;
import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

import static se.havochvatten.symphony.mapper.AreaSelectionResponseDtoMapper.mapSensitivityMatrixToDto;

@Stateless
public class CalculationAreaService {
    private static final Logger LOG = LoggerFactory.getLogger(CalculationAreaService.class);
    private static ObjectMapper mapper = new ObjectMapper();

    @PersistenceContext(unitName = "symphonyPU")
    public EntityManager em;

    @EJB
    BaselineVersionService baselineVersionService;

    @EJB
    CalcAreaSensMatrixService calcAreaSensMatrixService;

    /**
     * @return All CalculationAreas defined in the system (areas meant to be used in calculations)
     */
    public List<CalculationArea> findCalculationAreas(String baselineName) {
        return em.createNamedQuery("CalculationArea.findByBaselineName")
                .setParameter("name", baselineName)
                .getResultList();
    }

    /**
     * @return AreaSelectionResponseDto with information to frontend about Area tyes, areas and sensitivity
     * matrices for selection/input to calculation
     */
    public AreaSelectionResponseDto areaSelect(String baselineName, Object polygon, Principal principal)
            throws SymphonyStandardAppException {
        try {
            String roi = mapper.writeValueAsString(polygon);
            Geometry geoRoi = jsonToGeometry(roi);
            BaselineVersion baselineVersion = baselineVersionService.getVersionByName(baselineName);
            List<CalculationArea> calcAreasWithinRoi = getAreasWithinPolygon(geoRoi,
                    baselineVersion.getId()); // expensive?

            List<CalculationArea> defaultAreas = calcAreasWithinRoi
                .stream()
                .filter((ca) -> ca.isCareaDefault())
                .collect(Collectors.toList());

            if(defaultAreas.size() > 1) {
                GeometryJSON geoJson = new GeometryJSON();
                ObjectMapper mapper = new JsonMapper();
                List<AreaOverlapFragment> fragmentMap = new ArrayList<>();

                for(CalculationArea dca : defaultAreas) {
                    List<String> daPolygons = dca.getCaPolygonList()
                        .stream().map(CaPolygon::getPolygon).toList();
                    for (String dapStr : daPolygons) {
                        Geometry daPolygon = jsonToGeometry(dapStr);
                        if (daPolygon.intersects(geoRoi)) {
                            var defMatrixFragment = new AreaOverlapFragment();
                            defMatrixFragment.polygon = mapper.readTree(geoJson.toString(geoRoi.intersection(daPolygon)));
                            defMatrixFragment.defaultMatrix = mapSensitivityMatrixToDto(dca.getdefaultSensitivityMatrix());
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
                commonBaselineMatrices.removeIf(m -> m.getSensitivityMatrix().getId() == defaultArea.getdefaultSensitivityMatrix().getId());
                AreaSelectionResponseDto resp = AreaSelectionResponseDtoMapper.mapToDto(defaultArea,
                    areaTypeDtos, userDefinedMatrices, commonBaselineMatrices);
                return resp;
            }
        } catch (IOException e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.MAPPING_OBJECT_TO_POLYGON_STRING_ERROR);
        }
    }

    /**
     * @return CalculationAreaDto having id
     */
    public CalculationAreaDto get(Integer id) throws SymphonyStandardAppException {
        CalculationArea calculationArea = em.find(CalculationArea.class, id);
        if (calculationArea == null) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.CALCULATION_AREA_NOT_FOUND);
        }
        CalculationAreaDto calculationAreaDto = CalculationAreaMapper.mapToDto(calculationArea);
        return calculationAreaDto;
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

    /**
     * Get the selected areas for the calculation that are within the selected polygon together with their
     * sensitivity matrices. The area/areas that are not explicitly selected but are within the selected
     * polygon and registered as default area will be the default area/areas with their sensitivity
     * matrix/matrices.
     */
    public MatrixResponse getAreaCalcMatrices(Scenario scenario) throws SymphonyStandardAppException,
            IOException {
        // TODO make use of L2 cache?
        var matrixParameters = scenario.getMatrixParameters();

        List<AreaMatrixMapping> areaMatrices = new ArrayList<>();
        if (matrixParameters.userDefinedMatrixId == null) {
            areaMatrices =
                    ((MatrixParameters) matrixParameters).areaTypes.stream()
                            .flatMap(areaType -> areaType.areaMatrices.stream())
                            .collect(Collectors.toList());
        }

        var roi = scenario.getGeometry();
        BaselineVersion baseline = baselineVersionService.getBaselineVersionById(scenario.getBaselineId());
        List<CalculationArea> careasMatching = getAreasWithinPolygon(roi, baseline.getId());
        List<Integer> careasMatchingIds =
                careasMatching.stream().map(CalculationArea::getId).collect(Collectors.toList());

        List<Integer> reqAreaIds =
                areaMatrices.stream().map(AreaMatrixMapping::getAreaId).collect(Collectors.toList());

        List<AreaMatrixMapping> relevantSelectedAreaMatrices =
                areaMatrices.stream().filter((a) -> careasMatchingIds.contains(a.getAreaId())).collect(Collectors.toList());

        List<CalculationArea> defaultAreas =
                careasMatching.stream().filter((cm) -> cm.isCareaDefault()).collect(Collectors.toList());

        List<CalculationArea> relevantNonDefaultCalcAreas =
                careasMatching.stream().filter((cm) -> !cm.isCareaDefault() && reqAreaIds.contains(cm.getId())).collect(Collectors.toList());

        MatrixResponse resp = new MatrixResponse();
        resp.areaMatrixResponses = getAreaMatrixResponseDtos(roi, relevantSelectedAreaMatrices,
                defaultAreas, relevantNonDefaultCalcAreas);
        resp.sensitivityMatrices = getMatrixList(relevantSelectedAreaMatrices, defaultAreas,
                baseline.getId());
        resp.normalizationValue = getNormalization(defaultAreas, scenario.getNormalization());

        if (matrixParameters.userDefinedMatrixId != null) {
            overrideMatrixIds(resp, matrixParameters.userDefinedMatrixId, baseline.getId());
        }

        return resp;
    }

    void overrideMatrixIds(MatrixResponse matrixResponse, Integer overridingMatrixId,
                           int baseDataVersionId) throws SymphonyStandardAppException {
        matrixResponse.areaMatrixResponses.forEach(a -> {
            a.setMatrixId(overridingMatrixId);
        });
        SensitivityMatrix sensitivityMatrix = new SensitivityMatrix(overridingMatrixId,
                getSensitivityMatrix(overridingMatrixId, baseDataVersionId));
        // The areas only reference to one matrix in this case
        matrixResponse.sensitivityMatrices.clear();
        matrixResponse.sensitivityMatrices.add(sensitivityMatrix);
    }

    /**
     * @return calculation areas within the selected polygon
     */
    List<CalculationArea> getAreasWithinPolygon(Geometry selectedPolygon, int baseDataVersionId) throws SymphonyStandardAppException {
        Set<CalculationArea> matchingCalcAreaSet = new HashSet<>();
        List<CaPolygon> allCaPolygons = em.createNamedQuery("CaPolygon.findForBaselineVersionId",
                CaPolygon.class).setParameter("versionId", baseDataVersionId).getResultList();
        for (CaPolygon cap : allCaPolygons) {
            if (jsonToGeometry(cap.getPolygon()).intersects(selectedPolygon)) {
                matchingCalcAreaSet.add(cap.getCalculationArea());
            }
        }
        return new ArrayList<>(matchingCalcAreaSet);
    }

    /**
     * @return Normalization MaxValue for NormalizationType (national for country, msp for defaultArea)
     */
    double getNormalization(List<CalculationArea> defaultAreas, NormalizationOptions normalization) {
        double maxValue = 0;
        switch (normalization.type) {
            case DOMAIN:
                Optional<CalculationArea> caOpt =
                        defaultAreas.stream().filter(d -> d.isCareaDefault()).findFirst();
                if (caOpt.isPresent())
                    maxValue = caOpt.get().getMaxValue() == null ? 0 : caOpt.get().getMaxValue();
                break;
            case USER_DEFINED:
                maxValue = normalization.userDefinedValue;
                break;
            case AREA:
            case PERCENTILE:
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
            areaMatrixResponseDto.setMatrixId(defaultArea.getdefaultSensitivityMatrix() == null ? null :
                    defaultArea.getdefaultSensitivityMatrix().getId());
            List<String> polygons =
                    defaultArea.getCaPolygonList().stream().map(p -> p.getPolygon()).collect(Collectors.toList());
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
                    nonDefaultArea.getCaPolygonList().stream().map(p -> p.getPolygon()).collect(Collectors.toList());
            areaMatrixResponseDto.getPolygons().addAll(withinSelectedPolygon(selectedPolygon, polygons));
            areaMatrixResponseDtos.add(areaMatrixResponseDto);
        }
        return areaMatrixResponseDtos;
    }

    /**
     * @return The matrices referenced by the areas in the service response (MatrixResponse).
     */
    List<SensitivityMatrix> getMatrixList(List<AreaMatrixMapping> relevantSelectedAreaMatrices,
                                          List<CalculationArea> defaultAreas, Integer baseDataVersionId)
            throws SymphonyStandardAppException {
        Set<SensitivityMatrix> sensitivityMatrices = new HashSet();

        for (CalculationArea defaultArea : defaultAreas) {
            SensitivityMatrix sensitivityMatrix =
                    new SensitivityMatrix(defaultArea.getdefaultSensitivityMatrix().getId(),
                            getSensitivityMatrix(defaultArea.getdefaultSensitivityMatrix().getId(),
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
    double[][] getSensitivityMatrix(Integer matrixId, int baseDataVersionId) throws SymphonyStandardAppException {
        if (em.find(se.havochvatten.symphony.entity.SensitivityMatrix.class, matrixId) == null) {
            return new double[][]{};
        }

        List<Metadata> metadataPressList = em.createQuery("SELECT mp FROM Metadata mp WHERE mp" +
                ".symphonyCategory = :category AND mp.baselineVersion.id = :versionid ORDER BY mp" +
                ".bandNumber ASC").setParameter("category", "Pressure").setParameter("versionid",
                baseDataVersionId).getResultList();
        List<Metadata> metadataEcoList = em.createQuery("SELECT me FROM Metadata me WHERE me" +
                ".symphonyCategory = :category AND me.baselineVersion.id = :versionid ORDER BY me" +
                ".bandNumber ASC").setParameter("category", "Ecosystem").setParameter("versionid",
                baseDataVersionId).getResultList();

        double[][] matrix = new double[metadataPressList.size()][metadataEcoList.size()];
        for (int i = 0; i < metadataPressList.size(); i++) {
            double[] sensRow = getSensValueRow(matrixId, metadataPressList.get(i).getId(), metadataEcoList);
            matrix[i] = sensRow;
        }

        return matrix;
    }

    /**
     * @return A row of sensitivity values in the matrix. The ecocomponents connected to pressure. Ordered by
     * band number in metadata,
     */
    private double[] getSensValueRow(Integer matrixId, Integer presId, List<Metadata> metadataEcoList) {
        double[] sensRow = new double[metadataEcoList.size()];
        for (int j = 0; j < sensRow.length; j++) {
            Optional<Sensitivity> optSens =
                    metadataEcoList.get(j).getEcoSensitivities()
                            .stream()
                            .filter(e -> e.getSensitivityMatrix().getId().equals(matrixId) &&
                                            e.getPresMetadata().getId().equals(presId))
                            .findAny();
            sensRow[j] = optSens.isPresent() ? optSens.get().getValue().doubleValue() : Double.NaN; // Encode
            // absence of value using NaN
        }
        return sensRow;
    }

    public List<Geometry> withinSelectedPolygon(Geometry selectedPolygon, List<String> polygons) throws SymphonyStandardAppException {
        List<Geometry> geoPolygons = jsonListToGeometryList(polygons);
        return geoPolygons.stream().map(p -> selectedPolygon.intersection(p)).collect(Collectors.toList());
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
     * @throws SymphonyStandardAppException
     */
    private List<AreaType> getAreaTypes(List<CalculationArea> calulationAreas) throws SymphonyStandardAppException {
        List<AreaType> areatypes =
                calulationAreas.stream().filter(ca -> !ca.isCareaDefault() && ca.getAreaType() != null).map((ca) -> ca.getAreaType()).distinct().collect(Collectors.toList());
        return areatypes;
    }

    /**
     * @return Alist of calculation areas with requested areaType from the given calulationAreas
     */
    List<CalculationArea> getNonDefaultAreasForAreaType(Integer areaTypeId,
                                                        List<CalculationArea> calulationAreas) throws SymphonyStandardAppException {
        return calulationAreas.stream().filter((ca) -> !ca.isCareaDefault() && ca.getAreaType() != null && ca.getAreaType().getId().equals(areaTypeId)).collect(Collectors.toList());
    }

    /**
     * @return A Geometry object created from the string geoJSON
     */
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
     * @return A list of geometries (List<Geometry>) from the geoJSON list of strings geoJSONList
     */
    private List<Geometry> jsonListToGeometryList(List<String> geoJSONList) throws SymphonyStandardAppException {
        List<Geometry> geometries = new ArrayList<>();
        for (String geoJSON : geoJSONList) {
            geometries.add(jsonToGeometry(geoJSON));
        }
        return geometries;
    }
}

