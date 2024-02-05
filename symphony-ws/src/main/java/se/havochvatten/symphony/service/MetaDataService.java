package se.havochvatten.symphony.service;

import se.havochvatten.symphony.dto.MetadataComponentDto;
import se.havochvatten.symphony.dto.MetadataDto;
import se.havochvatten.symphony.dto.SymphonyBandDto;
import se.havochvatten.symphony.dto.MetadataSymphonyThemeDto;
import se.havochvatten.symphony.entity.Metadata;
import se.havochvatten.symphony.entity.SymphonyBand;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.*;

@Stateless
public class MetaDataService {
    @PersistenceContext(unitName = "symphonyPU")
    public EntityManager em;

    @EJB
    BaselineVersionService baselineVersionService;

    public MetadataDto findMetadata(String baselineName, String preferredLanguage) throws SymphonyStandardAppException {
        BaselineVersion baseline = baselineVersionService.getVersionByName(baselineName);
        MetadataDto metadataDto = new MetadataDto();
        metadataDto.setEcoComponent(getComponentDto("Ecosystem", baseline.getId(), preferredLanguage));
        metadataDto.setPressureComponent(getComponentDto("Pressure", baseline.getId(), preferredLanguage));
        metadataDto.setLanguage(preferredLanguage);
        return metadataDto;
    }

    public MetadataComponentDto getComponentDto(String componentName, int baselineVersionId, String language) {
        MetadataComponentDto componentDto = new MetadataComponentDto();

        List<SymphonyBand> bandsList = getBandsForBaselineComponent(componentName, baselineVersionId);

        // Select all Metadata for the given SymphonyBands and the given language.
        // If a translation for a field is not found, fall back to baseline default language.
        List<Metadata> metadataList =
            em.createQuery("SELECT m FROM Metadata m " +
                              "WHERE m.band IN :bandsList " +
                                "AND (m.language = :language " +
                                    "OR (m.language = m.band.baseline.locale " +
                                        "AND m.metaField NOT IN " +
                                            "(SELECT m2.metaField FROM Metadata m2 " +
                                                "WHERE m2.band IN :bandsList " +
                                                "AND m2.language = :language)))")
                .setParameter("bandsList", bandsList)
                .setParameter("language", language)
                .getResultList();

        // Group Metadata (metadataList) by SymphonyTheme
        // and add in alphabetical order to the componentDto's getSymphonyThemes list
        metadataList.stream()
            .filter(m -> m.getMetaField().equals("symphonytheme"))
            .sorted(Comparator.comparing(Metadata::getMetaValue))
            .map(Metadata::getMetaValue)
            .distinct()
            .forEachOrdered(t -> {
                MetadataSymphonyThemeDto symphonyThemeDto = new MetadataSymphonyThemeDto();
                symphonyThemeDto.setSymphonyThemeName(t);
                symphonyThemeDto.setBands(new ArrayList<>());
                metadataList.stream()
                    .filter(m2 -> m2.getMetaField().equals("symphonytheme")
                               && m2.getMetaValue().equals(t))
                    .map(m2 -> {
                        SymphonyBandDto propertyDto = new SymphonyBandDto(m2.getBand());
                        m2.getBand().getMetaValues().stream()
                            .filter(metadataList::contains)
                            .forEach(m -> propertyDto.getMeta().put(m.getMetaField(), m.getMetaValue()));
                        return propertyDto;
                    }).forEachOrdered(symphonyThemeDto.getBands()::add);
                componentDto.getSymphonyThemes().add(symphonyThemeDto);
            });

        return componentDto;
    }

    public List<SymphonyBand> getBandsForBaselineComponent(String componentName, int baselineVersionId) {
        return em.createQuery(
            "SELECT b FROM SymphonyBand b " +
                "WHERE b.baseline.id = :baselineVersionId " +
                "AND b.category = :category")
            .setParameter("baselineVersionId", baselineVersionId)
            .setParameter("category", componentName)
            .getResultList();
    }

    public SymphonyBand getBandById(Integer id) throws SymphonyStandardAppException {
        SymphonyBand band = em.find(SymphonyBand.class, id);
        if (band == null) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.METADATA_NOT_FOUND_FOR_ID);
        }
        return band;
    }
}
