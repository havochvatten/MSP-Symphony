package se.havochvatten.symphony.service;

import se.havochvatten.symphony.entity.AreaType;
import se.havochvatten.symphony.entity.CalculationArea;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.exception.SymphonyStandardSystemException;

import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Stateless
public class AreaTypeService {
    @PersistenceContext(unitName = "symphonyPU")
    private EntityManager em;

    /**
     * @return All Area Types registered
     */
    public List<AreaType> findAll() {
        return em.createNamedQuery("AreaType.findAll", AreaType.class).getResultList();
    }

    /**
     * Create AreaType
     *
     * @return AreaType
     * @throws SymphonyStandardAppException
     */
    public AreaType createAreaType(AreaType areaType) throws SymphonyStandardAppException {
        AreaType foundAreaTypeById = getAreaType(areaType.getId());
        if (foundAreaTypeById != null) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.AREA_TYPE_EXISTS_ERROR);
        }
        AreaType existingAreaTypeByName = getAreaTypeByName(areaType.getAtypeName());
        if (existingAreaTypeByName != null && !areaType.getId().equals(existingAreaTypeByName.getId())) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.AREA_TYPE_NAME_EXISTS_ON_OTHER);
        }
        try {
            areaType.setId(null);
            em.persist(areaType);
            return areaType;
        } catch (Exception e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.AREA_TYPE_SAVE_ERROR);
        }
    }

    /**
     * Update AreaType
     *
     * @param areaType
     * @return AreaType
     * @throws SymphonyStandardAppException
     */
    public AreaType updateAreaType(AreaType areaType) throws SymphonyStandardAppException {
        AreaType areaTypeToUpdate = getAreaType(areaType.getId());
        if (areaTypeToUpdate == null) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.AREA_TYPE_NOT_FOUND);
        }
        AreaType existingAreaTypeByName = getAreaTypeByName(areaType.getAtypeName());
        if (existingAreaTypeByName != null && !existingAreaTypeByName.getId().equals(areaType.getId())) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.AREA_TYPE_NAME_EXISTS_ON_OTHER);
        }
        return em.merge(areaType);
    }

    /**
     * Delete a AreaType wit the given id
     */
    public void delete(Integer id) throws SymphonyStandardAppException {
        AreaType userDefinedArea = getAreaTypeById(id);
        if (userDefinedArea == null) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.AREA_TYPE_NOT_FOUND);
        }
        if (areaTypeUsed(id)) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.AREA_TYPE_USED);
        }
        em.remove(userDefinedArea);
    }

    /**
     * Get AreaType by id
     *
     * @return AreaType
     */
    public AreaType getAreaType(Integer id) {
        try {
            if (id == null) {
                return null;
            }
            return em.find(AreaType.class, id);
        } catch (Exception e) {
            throw new SymphonyStandardSystemException(SymphonyModelErrorCode.AREA_TYPE_FIND_ERROR);
        }
    }

    /**
     * Find the AreaType with the given id
     *
     * @return AreaType
     */
    private AreaType getAreaTypeById(Integer id) throws SymphonyStandardAppException {
        try {
            return em.find(AreaType.class, id);
        } catch (Exception e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.USER_DEF_AREA_NOT_FOUND);
        }
    }

    /**
     * Return null if a AreaType with the given name not already exists else return the first AreaType found
     * (name should be unique)
     *
     * @param name
     * @return UserDefinedArea
     */
    private AreaType getAreaTypeByName(String name) {
        List<AreaType> userDefinedAreas =
				em.createQuery("Select a FROM AreaType a WHERE a.atypeName = :name", AreaType.class)
						.setParameter("name", name)
						.getResultList();
		if (userDefinedAreas.isEmpty()) {
            return null;
        }
        return userDefinedAreas.get(0);
    }

    /**
     * @return true if AreaType is used in CalculationArea
     */
    private boolean areaTypeUsed(Integer id) {
        List<CalculationArea> areaTypesUsed =
				em.createQuery("Select c FROM CalculationArea c WHERE c.areaType.id = :id", CalculationArea.class)
						.setParameter("id", id)
						.getResultList();
        return !areaTypesUsed.isEmpty();
    }
}
