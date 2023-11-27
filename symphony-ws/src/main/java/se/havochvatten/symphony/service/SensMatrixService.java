package se.havochvatten.symphony.service;

import se.havochvatten.symphony.dto.SensMatrixDto;
import se.havochvatten.symphony.dto.SensitivityDto;
import se.havochvatten.symphony.entity.*;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.mapper.EntityToSensMatrixDtoMapper;
import se.havochvatten.symphony.mapper.SensMatrixDtoToEntityMapper;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;


@Stateless
public class SensMatrixService {
    @PersistenceContext(unitName = "symphonyPU")
    private EntityManager em;

    @EJB
    BaselineVersionService baselineVersionService;

    @EJB
    MetaDataService metaDataService;

    public List<SensMatrixDto> findSensMatrixDtos(String baselineName, String preferredLanguage) {
        List<SensMatrixDto> sensMatrixDtos = new ArrayList<>();
        List<SensitivityMatrix> matrices = em.createNamedQuery("SensitivityMatrix.findByBaselineName")
                .setParameter("name", baselineName)
                .getResultList();
        matrices.forEach(s -> sensMatrixDtos.add(EntityToSensMatrixDtoMapper.map(s, preferredLanguage)));
        return sensMatrixDtos;
    }

    public List<SensMatrixDto> findSensMatrixDtosByOwner(String baselineName, Principal principal, String preferredLanguage) {
        List<SensMatrixDto> sensMatrixDtos = new ArrayList<>();
        List<SensitivityMatrix> matrices = em.createNamedQuery("SensitivityMatrix.findByBaselineNameAndOwner")
                .setParameter("name", baselineName)
                .setParameter("owner", principal.getName())
                .getResultList();
        matrices.forEach(s -> sensMatrixDtos.add(EntityToSensMatrixDtoMapper.map(s, preferredLanguage)));
        return sensMatrixDtos;
    }

    public SensMatrixDto getSensMatrixbyId(Integer id, String preferredLanguage) throws SymphonyStandardAppException {
        SensitivityMatrix sensitivityMatrix = em.find(SensitivityMatrix.class, id);
        if (sensitivityMatrix == null) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.SENSITIVITY_MATRIX_NOT_FOUND);
        }
        return EntityToSensMatrixDtoMapper.map(sensitivityMatrix, preferredLanguage);
    }

    public SensMatrixDto createSensMatrix(SensMatrixDto sensMatrixDto, String baseLineName,
                                          String preferredLanguage,
										  Principal principal) throws SymphonyStandardAppException {
        List<Sensitivity> sensitivities = getEntitySensitivities(sensMatrixDto, false);
        BaselineVersion baselineVersion = baselineVersionService.getVersionByName(baseLineName);
        SensitivityMatrix sensitivityMatrix = SensMatrixDtoToEntityMapper.mapToEntity(sensMatrixDto,
				sensitivities, baselineVersion);
        sensitivityMatrix.setId(null);
        sensitivityMatrix.setOwner(principal.getName());
        em.persist(sensitivityMatrix);

        sensMatrixDto = EntityToSensMatrixDtoMapper.map(sensitivityMatrix, preferredLanguage);
        return sensMatrixDto;
    }

    public SensMatrixDto updateSensMatrix(SensMatrixDto sensMatrixDto, String preferredLanguage, Principal principal) throws SymphonyStandardAppException {
        SensitivityMatrix sensMatrixFound = em.find(SensitivityMatrix.class, sensMatrixDto.getId());
        if (sensMatrixFound == null) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.SENSITIVITY_MATRIX_NOT_FOUND);
        }
        if (!principal.getName().equals(sensMatrixFound.getOwner())) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.SENSITIVITY_MATRIX_NOT_OWNED_BY_USER);
        }
        checkMatrixName(sensMatrixDto.getName(), sensMatrixFound.getBaselineVersion().getName(),
				sensMatrixDto.getId(), principal.getName());

        List<Sensitivity> sensitivities = getEntitySensitivities(sensMatrixDto, true);
        BaselineVersion baselineVersion =
				baselineVersionService.getVersionByName(sensMatrixFound.getBaselineVersion().getName());
        SensitivityMatrix sensitivityMatrix = SensMatrixDtoToEntityMapper.mapToEntity(sensMatrixDto,
				sensitivities, baselineVersion);
        sensitivityMatrix.setOwner(principal.getName());
        em.merge(sensitivityMatrix);

        sensMatrixDto = EntityToSensMatrixDtoMapper.map(sensitivityMatrix, preferredLanguage);
        return sensMatrixDto;
    }

    public void delete(Integer id, Principal principal) throws SymphonyStandardAppException {
        SensitivityMatrix sensitivityMatrix = em.find(SensitivityMatrix.class, id);
        if (sensitivityMatrix == null) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.SENSITIVITY_MATRIX_NOT_FOUND);
        }
        if (principal.getName() == null || !principal.getName().equals(sensitivityMatrix.getOwner())) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.SENSITIVITY_MATRIX_NOT_OWNED_BY_USER);
        }
        em.remove(sensitivityMatrix);
    }

    private List<Sensitivity> getEntitySensitivities(SensMatrixDto sensMatrixDto, boolean forUpdate) throws SymphonyStandardAppException {
        List<Sensitivity> sensitivities = new ArrayList<>();
        Sensitivity sens;
        for (SensitivityDto.SensRow r : sensMatrixDto.getSensMatrix().getRows()) {
            SymphonyBand pressureBand = metaDataService.getBandById(r.getPresMetaId());
            for (SensitivityDto.SensCol c : r.getColumns()) {
                sens = new Sensitivity();
                if(forUpdate) { /* merge/update */
                    sens.setId(c.getSensId());
                }
                sens.setPressureBand(pressureBand);
                sens.setEcoBand(metaDataService.getBandById(c.getEcoMetaId()));
                sens.setValue(c.getValue());
                sensitivities.add(sens);
            }
        }
        return sensitivities;
    }


    private void checkMatrixName(String matrixName, String baselineName, int matrixId, String owner) throws SymphonyStandardAppException {
        List<SensitivityMatrix> matrices = em.createNamedQuery("SensitivityMatrix.findByMatrixNameAndOwnerAndBaseline")
                .setParameter("matrixName", matrixName)
                .setParameter("owner", owner)
                .setParameter("baseLineName", baselineName)
                .getResultList();
        if (matrices.size() > 0 && matrices.get(0).getId() != matrixId) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.SENSITIVITY_MATRIX_NAME_ALREADY_EXISTS);
        }
    }
}
