package se.havochvatten.symphony.service;

import se.havochvatten.symphony.dto.CalcAreaSensMatrixDto;
import se.havochvatten.symphony.entity.CalcAreaSensMatrix;
import se.havochvatten.symphony.entity.CalculationArea;
import se.havochvatten.symphony.entity.SensitivityMatrix;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.mapper.CalcAreaSensMatrixMapper;

import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.security.Principal;
import java.util.List;

@Stateless
public class CalcAreaSensMatrixService {
    @PersistenceContext(unitName = "symphonyPU")
    EntityManager em;

    /**
     * @return All CalcAreaSensMatrices defined in the system (defines what areas that can be used with
     * specified sensitivity matrices in calculations)
     */
    public List<CalcAreaSensMatrix> find() {
        return em.createNamedQuery("CalcAreaSensMatrix.findAll", CalcAreaSensMatrix.class).getResultList();
    }

    /**
     * Create a new CalcAreaSensMatrix and save to db
     *
     * @return calcAreaSensMatrixDto
     */
    public CalcAreaSensMatrixDto create(CalcAreaSensMatrixDto calcAreaSensMatrixDto) {
        CalculationArea calculationArea = em.find(CalculationArea.class, calcAreaSensMatrixDto.getCalcareaId());
        SensitivityMatrix sensitivityMatrix = em.find(SensitivityMatrix.class,
				calcAreaSensMatrixDto.getSensmatrixId());
        CalcAreaSensMatrix calcAreaSensMatrix = CalcAreaSensMatrixMapper.mapToEntity(calcAreaSensMatrixDto,
				calculationArea, sensitivityMatrix);
        calcAreaSensMatrix.setId(null);
        em.persist(calcAreaSensMatrix);
        return CalcAreaSensMatrixMapper.mapToDto(calcAreaSensMatrix);
    }

    /**
     * @return CalcAreaSensMatrixDto with id
     */
    public CalcAreaSensMatrixDto get(Integer id) throws SymphonyStandardAppException {
        CalcAreaSensMatrix calcAreaSensMatrix = getCalcAreaSensMatrix(id);
        return CalcAreaSensMatrixMapper.mapToDto(calcAreaSensMatrix);
    }

    public List<CalcAreaSensMatrix> findByBaselineAndArea(String baselineName, int calcAreaId) {
        return em.createNamedQuery("CalcAreaSensMatrix.findByBaselineAndArea", CalcAreaSensMatrix.class)
                .setParameter("baseline", baselineName)
                .setParameter("calcAreaId", calcAreaId)
                .getResultList();
    }

    public List<CalcAreaSensMatrixDto> findByBaselineAndOwner(String baselineName, Principal principal) {
        List<CalcAreaSensMatrix> calcAreaSensMatrices =
				em.createNamedQuery("CalcAreaSensMatrix.findByBaselineAndOwner", CalcAreaSensMatrix.class)
						.setParameter("baseline", baselineName)
						.setParameter("owner", principal.getName())
						.getResultList();
        return CalcAreaSensMatrixMapper.mapToDtos(calcAreaSensMatrices);
    }

    public List<CalcAreaSensMatrix> findByBaselineAndOwnerAndArea(String baselineName, Principal principal,
																  int calcAreaId) {
        return em.createNamedQuery("CalcAreaSensMatrix.findByBaselineAndOwnerAndArea", CalcAreaSensMatrix.class)
                .setParameter("baselineName", baselineName)
                .setParameter("owner", principal.getName())
                .setParameter("calcAreaId", calcAreaId)
                .getResultList();
    }

    /**
     * Update CalcAreaSensMatrix
     *
     * @return calcAreaSensMatrixDto
     */
    public CalcAreaSensMatrixDto update(CalcAreaSensMatrixDto calcAreaSensMatrixDto) throws SymphonyStandardAppException {
        CalcAreaSensMatrix calcAreaSensMatrixToUpdate;
        CalculationArea calculationArea = getCalculationArea(calcAreaSensMatrixDto.getCalcareaId());
        SensitivityMatrix sensitivityMatrix = getSensitivityMatrix(calcAreaSensMatrixDto.getSensmatrixId());
        calcAreaSensMatrixToUpdate = CalcAreaSensMatrixMapper.mapToEntity(calcAreaSensMatrixDto,
				calculationArea, sensitivityMatrix);
        calcAreaSensMatrixToUpdate = em.merge(calcAreaSensMatrixToUpdate);
        return CalcAreaSensMatrixMapper.mapToDto(calcAreaSensMatrixToUpdate);
    }

    /**
     * Delete a CalcAreaSensMatrix with id
     */
    public void delete(Integer id) throws SymphonyStandardAppException {
        CalcAreaSensMatrix calcAreaSensMatrix = getCalcAreaSensMatrix(id);
        em.remove(calcAreaSensMatrix);
    }

    /**
     * Delete all calcAreaMatrix objects with areaId for this owner
     */
    public void deleteByAreaIdAndOwner(Integer matrixId, Principal principal) throws SymphonyStandardAppException {
        List<CalcAreaSensMatrix> calcAreaSensMatrices = em.createNamedQuery("CalcAreaSensMatrix.findByMatrixIdAndOwner", CalcAreaSensMatrix.class)
				.setParameter("matrixId", matrixId)
				.setParameter("owner", principal.getName())
				.getResultList();
        if (calcAreaSensMatrices.isEmpty()) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.CALC_AREA_SENS_MATRIX_NOT_FOUND);
        }
        calcAreaSensMatrices.forEach(cs -> em.remove(cs));
    }

    private CalcAreaSensMatrix getCalcAreaSensMatrix(Integer id) throws SymphonyStandardAppException {
        CalcAreaSensMatrix calcAreaSensMatrix = em.find(CalcAreaSensMatrix.class, id);
        if (calcAreaSensMatrix == null) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.CALC_AREA_SENS_MATRIX_NOT_FOUND);
        }
        return calcAreaSensMatrix;
    }

    private CalculationArea getCalculationArea(Integer id) throws SymphonyStandardAppException {
        CalculationArea calculationArea = em.find(CalculationArea.class, id);
        if (calculationArea == null) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.CALCULATION_AREA_NOT_FOUND);
        }
        return calculationArea;
    }

    private SensitivityMatrix getSensitivityMatrix(Integer id) throws SymphonyStandardAppException {
        SensitivityMatrix sensitivityMatrix = em.find(SensitivityMatrix.class, id);
        if (sensitivityMatrix == null) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.SENSITIVITY_MATRIX_NOT_FOUND);
        }
        return sensitivityMatrix;
    }
}
