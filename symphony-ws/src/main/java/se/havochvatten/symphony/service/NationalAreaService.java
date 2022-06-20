package se.havochvatten.symphony.service;

import se.havochvatten.symphony.entity.NationalArea;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;

import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;

@Stateless
public class NationalAreaService {
    @PersistenceContext(unitName = "symphonyPU")
    EntityManager em;

    /**
     * @return JSON structure with the areas belonging to the country with the given iso3 country code and
     * type
     */
    public NationalArea getNationalAreaByCountryAndType(String countryCodeIso3, String type)
            throws SymphonyStandardAppException {
        NationalArea nationalArea = null;
        try {
            nationalArea = em.createNamedQuery("NationalArea.findByCountryIso3AndType", NationalArea.class)
                    .setParameter("countryIso3", countryCodeIso3)
                    .setParameter("type", type)
                    .getSingleResult();
        } catch (NoResultException e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.NATIONAL_AREA_NOT_FOUND);
        }
        return nationalArea;
    }

}
