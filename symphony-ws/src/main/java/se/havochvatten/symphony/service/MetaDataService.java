package se.havochvatten.symphony.service;

import org.apache.commons.lang3.ArrayUtils;
import se.havochvatten.symphony.dto.*;
import se.havochvatten.symphony.entity.Metadata;
import se.havochvatten.symphony.entity.SymphonyBand;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Tuple;
import javax.persistence.TypedQuery;
import java.util.*;

@Stateless
public class MetaDataService {
    @PersistenceContext(unitName = "symphonyPU")
    public EntityManager em;

    @EJB
    BaselineVersionService baselineVersionService;

    public final static String fullMetaQuery = "SELECT m FROM Metadata m " +
            "WHERE m.band IN :bandsList " +
            "AND (m.language = :language " +
            "OR (m.language = m.band.baseline.locale " +
            "AND m.metaField NOT IN " +
            "(SELECT m2.metaField FROM Metadata m2 " +
            "WHERE m2.band IN :bandsList " +
            "AND m2.language = :language)))";

    public final static String sparseMetaQuery = "SELECT m FROM Metadata m " +
            "WHERE m.band IN :bandsList " +
            "AND (m.language = :language " +
            "OR (m.language = m.band.baseline.locale " +
            "AND m.metaField IN ('title', 'symphonytheme')" +
            "AND m.metaField NOT IN " +
            "(SELECT m2.metaField FROM Metadata m2 " +
            "WHERE m2.band IN :bandsList " +
            "AND m2.metaField IN ('title', 'symphonytheme')" +
            "AND m2.language = :language)))";

    public MetadataDto findMetadata(String baselineName, String preferredLanguage, boolean sparse,
                                    String[] alternativeBandIds) throws SymphonyStandardAppException {
        BaselineVersion baseline = baselineVersionService.getVersionByName(baselineName);
        MetadataDto metadataDto = new MetadataDto();
        metadataDto.setEcoComponent(
            getComponentDto("Ecosystem", baseline, preferredLanguage, sparse, alternativeBandIds));
        metadataDto.setPressureComponent(
            getComponentDto("Pressure", baseline, preferredLanguage, sparse, alternativeBandIds));
        metadataDto.setLanguage(preferredLanguage);
        return metadataDto;
    }

    public Map<Integer, String>
        getComponentTitles(int baselineVersionId, LayerType category, String preferredLanguage)
        throws SymphonyStandardAppException {

        TypedQuery<Tuple> bandTitlesQuery = em.createQuery(
            "SELECT m.band.bandnumber, m.metaValue FROM Metadata m " +
                    "WHERE m.band.baseline.id = :baselineVersionId " +
                    "AND m.metaField = 'title' " +
                    "AND m.band.category = :category " +
                    "AND (m.language = :language " +
                        "OR (m.language = m.band.baseline.locale " +
                        "AND m.metaField NOT IN " +
                            "(SELECT m2.metaField FROM Metadata m2 " +
                            "WHERE m2.band.baseline.id = :baselineVersionId " +
                            "AND m2.metaField = 'title' " +
                            "AND m2.language = :language)))" +
                    "ORDER BY m.band.bandnumber", Tuple.class);

        return bandTitlesQuery
            .setParameter("baselineVersionId", baselineVersionId)
            .setParameter("category", category == LayerType.ECOSYSTEM ? "Ecosystem" : "Pressure")
            .setParameter("language", preferredLanguage)
            .getResultStream()
            .collect(HashMap::new, (m, t) -> m.put(t.get(0, Integer.class), t.get(1, String.class)), HashMap::putAll);
    }

    public MetadataComponentDto getComponentDto(String componentName, BaselineVersion baselineVersion, String language, boolean sparse,
                                                String[] alternativeBandIds) {
        MetadataComponentDto componentDto = new MetadataComponentDto();
        LayerType category = LayerType.valueOf(componentName.toUpperCase());

        List<SymphonyBand> bandsList = getBandsForBaselineComponent(componentName, baselineVersion.getId());
        AlternativeLayerMapping[] alternativeBands = baselineVersion.getAlternativeLayerMap().values().stream()
            .filter(alt -> alt.layerType.equals(category))
            .toArray(AlternativeLayerMapping[]::new);

        // Select all Metadata for the given SymphonyBands and the given language.
        // If a translation for a field is not found, fall back to baseline default language.
        List<Metadata> metadataList =
                em.createQuery(sparse ? sparseMetaQuery : fullMetaQuery, Metadata.class)
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

                        propertyDto.alternativeBands = Arrays.stream(alternativeBands)
                            .filter(alt -> alt.srcBandNumber == propertyDto.getBandNumber())
                            .map(alt -> new AlternativeBand(alt.altId, alt.getTitle()))
                            .toArray(AlternativeBand[]::new);

                        if(propertyDto.alternativeBands.length > 0) {
                            propertyDto.alternativeBands =
                                ArrayUtils.insert(0, propertyDto.alternativeBands,
                                    new AlternativeBand(propertyDto.altId, propertyDto.getTitle()));
                        }

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
                "AND b.category = :category", SymphonyBand.class)
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
