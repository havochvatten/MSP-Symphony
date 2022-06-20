package se.havochvatten.symphony.service;

import se.havochvatten.symphony.dto.MetadataComponentDto;
import se.havochvatten.symphony.dto.MetadataDto;
import se.havochvatten.symphony.dto.MetadataSymphonyTeamDto;
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
        return metadataDto;
    }

    public MetadataComponentDto getComponentDto(String componentName, int baselineVersionId) {
        MetadataComponentDto componentDto = new MetadataComponentDto();
		Set<String> symphonyTeams = new HashSet(em.createQuery("Select o.symphonyTeam from Metadata o where " +
						"o.symphonyCategory = :categ AND o.baselineVersion.id = :baselineVersionId")
				.setParameter("categ", componentName)
				.setParameter("baselineVersionId", baselineVersionId)
				.getResultList());
        SortedSet<String> symphonyTeamsSort = new TreeSet<>(symphonyTeams);
        symphonyTeamsSort.forEach(t -> {
            List<Metadata> teamMetaData = getSymphonyTeamMetaData(componentName, t, baselineVersionId);
            MetadataSymphonyTeamDto symphonyTeamDto =
					EntityToMetadataDtoMapper.mapEnitiesToMetaDataTeamDto(t, teamMetaData);
            componentDto.getSymphonyTeams().add(symphonyTeamDto);
        });
        return componentDto;
    }

    public List<Metadata> getSymphonyTeamMetaData(String componentName, String team, int baselineVersionId) {
        List<Metadata> teamMetaData = em.createQuery("Select o from Metadata o where o.symphonyCategory = " +
						":categ and o.symphonyTeam = :symphonyTeam AND o.baselineVersion.id = " +
						":baselineVersionId order by o.title")
                .setParameter("categ", componentName)
                .setParameter("symphonyTeam", team)
                .setParameter("baselineVersionId", baselineVersionId)
                .getResultList();
        return teamMetaData;
    }

    public Metadata getMetadataById(Integer id) throws SymphonyStandardAppException {
        Metadata metadata = em.find(Metadata.class, id);
        if (metadata == null) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.METADATA_NOT_FOUND_FOR_ID);
        }
        return metadata;
    }
}
