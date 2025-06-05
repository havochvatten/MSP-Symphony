package se.havochvatten.symphony.service;

import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;

import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import java.util.Date;
import java.util.List;

@Stateless
public class BaselineVersionService {
    @PersistenceContext(unitName = "symphonyPU")
    private EntityManager em;

    /**
     * @return BaselineVersion with the given name
     */
    public BaselineVersion getVersionByName(String name) throws SymphonyStandardAppException {
        List<BaselineVersion> versions = em.createNamedQuery("BaselineVersion.getByName",
                BaselineVersion.class).
            setParameter("name", name).
            getResultList();
        if (versions.size() > 1) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.BASELINE_VERSION_MULT_MATCHES);
        }
        if (versions.isEmpty()) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.BASELINE_VERSION_NOT_FOUND);
        }
        return versions.get(0);
    }

    /**
     * @return The BaselineVersion that is/was valid at date
     */
    public BaselineVersion getBaselineVersionByDate(Date date) throws SymphonyStandardAppException {
        Date minDateValid = getBaselineValidMinDate(date);
        List<BaselineVersion> versions = em.createQuery(
                "SELECT s FROM BaselineVersion s WHERE s.validFrom = :date", BaselineVersion.class).
            setParameter("date", minDateValid).
            getResultList();
        if (versions.size() > 1) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.BASELINE_VERSION_MULT_MATCHES);
        }
        if (versions.isEmpty()) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.BASELINE_VERSION_NOT_FOUND);
        }
        return versions.get(0);
    }

    public BaselineVersion getBaselineVersionById(Integer id) {
        return em.find(BaselineVersion.class, id);
    }

    /**
     * Get all Baseline/branch versions in the system
     *
     * @return List<BaselineVersion>
     */
    public List<BaselineVersion> findAll() {
        return em.createNamedQuery("BaselineVersion.findAll", BaselineVersion.class)
            .getResultList();
    }

    /**
     * @return the minimum validFrom date where validFrom >= date
     */
    private Date getBaselineValidMinDate(Date date) throws SymphonyStandardAppException {
        Date minDateValid;
        try {
            minDateValid = em.createQuery(
                    "SELECT MAX(s.validFrom) FROM BaselineVersion s WHERE s.validFrom <= :date", Date.class)
                .setParameter("date", date)
                .getSingleResult();
        } catch (NoResultException e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.BASELINE_VERSION_VALID_MINDATE_NOT_FOUND);
        }
        return minDateValid;
    }
}
