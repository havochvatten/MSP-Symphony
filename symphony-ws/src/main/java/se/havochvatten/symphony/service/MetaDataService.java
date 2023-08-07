package se.havochvatten.symphony.service;

import se.havochvatten.symphony.dto.MetadataComponentDto;
import se.havochvatten.symphony.dto.MetadataDto;
import se.havochvatten.symphony.dto.MetadataSymphonyThemeDto;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.entity.Metadata;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.mapper.EntityToMetadataDtoMapper;

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

    public MetadataDto findMetadata(String baselineName) throws SymphonyStandardAppException {
        BaselineVersion baseline = baselineVersionService.getVersionByName(baselineName);
        MetadataDto metadataDto = new MetadataDto();
        metadataDto.setEcoComponent(getComponentDto("Ecosystem", baseline.getId()));
        metadataDto.setPressureComponent(getComponentDto("Pressure", baseline.getId()));
        metadataDto.setLanguage(getLanguageFromLocale(baseline.getLocale()));
        return metadataDto;
    }

    private String getLanguageFromLocale(String locale) {
        // Resort to hackish way to get language instead of using the proper Locale class since we
        // may want some leeway in using non-national country codes
        return locale.substring(0,2).toLowerCase();
    }

    public MetadataComponentDto getComponentDto(String componentName, int baselineVersionId) {
        MetadataComponentDto componentDto = new MetadataComponentDto();
		Set<String> symphonyThemes = new HashSet(em.createQuery("Select o.symphonyTheme from Metadata o where " +
						"o.symphonyCategory = :categ AND o.baselineVersion.id = :baselineVersionId")
				.setParameter("categ", componentName)
				.setParameter("baselineVersionId", baselineVersionId)
				.getResultList());
        SortedSet<String> symphonyThemesSort = new TreeSet<>(symphonyThemes);
        symphonyThemesSort.forEach(t -> {
            List<Metadata> themeMetaData = getSymphonyThemeMetaData(componentName, t, baselineVersionId);
            MetadataSymphonyThemeDto symphonyThemeDto =
					EntityToMetadataDtoMapper.mapEntitiesToMetaDataThemeDto(t, themeMetaData);
            componentDto.getSymphonyThemes().add(symphonyThemeDto);
        });
        return componentDto;
    }

    public List<Metadata> getSymphonyThemeMetaData(String componentName, String theme, int baselineVersionId) {
        List<Metadata> themeMetaData = em.createQuery("Select o from Metadata o where o.symphonyCategory = " +
						":categ and o.symphonyTheme = :symphonyTheme AND o.baselineVersion.id = " +
						":baselineVersionId order by o.title")
                .setParameter("categ", componentName)
                .setParameter("symphonyTheme", theme)
                .setParameter("baselineVersionId", baselineVersionId)
                .getResultList();
        return themeMetaData;
    }

    public Metadata getMetadataById(Integer id) throws SymphonyStandardAppException {
        Metadata metadata = em.find(Metadata.class, id);
        if (metadata == null) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.METADATA_NOT_FOUND_FOR_ID);
        }
        return metadata;
    }
}
