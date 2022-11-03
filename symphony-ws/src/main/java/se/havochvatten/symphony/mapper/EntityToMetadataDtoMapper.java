package se.havochvatten.symphony.mapper;

import se.havochvatten.symphony.dto.MetadataPropertyDto;
import se.havochvatten.symphony.dto.MetadataSymphonyTeamDto;
import se.havochvatten.symphony.entity.Metadata;

import java.util.ArrayList;
import java.util.List;

public class EntityToMetadataDtoMapper {
    public static MetadataSymphonyTeamDto mapEnitiesToMetaDataTeamDto(String symphonyTeam,
																	  List<Metadata> metadataList) {
        MetadataSymphonyTeamDto symphonyTeamDto = new MetadataSymphonyTeamDto();
        symphonyTeamDto.setSymphonyTeamName(symphonyTeam);
        symphonyTeamDto.setProperties(new ArrayList<>());
        for (Metadata metadata : metadataList) {
            symphonyTeamDto.setSymphonyTeamNameLocal(metadata.getSymphonyTeamLocal());
            MetadataPropertyDto dto = mapEntityToPropertyDto(metadata);
            symphonyTeamDto.getProperties().add(dto);
        }
        return symphonyTeamDto;
    }

    private static MetadataPropertyDto mapEntityToPropertyDto(Metadata metadata) {
        MetadataPropertyDto dto = new MetadataPropertyDto();
        dto.setId(metadata.getId());
        dto.setTitle(metadata.getTitle());
        dto.setTitleLocal(metadata.getTitleLocal());
        dto.setDefaultSelected(metadata.isDefaultSelected());
        dto.setAccessUserRestrictions(metadata.getAccessUseRestrictions());
        dto.setAuthorEmail(metadata.getAuthorEmail());
        dto.setAuthorOrganisation(metadata.getAuthorOrganisation());
        dto.setRasterFileName(metadata.getRasterFileName());
        dto.setMetadataFileName(metadata.getMetadataFileName());
        dto.setDataOwner(metadata.getDataOwner());
        dto.setDataOwnerLocal(metadata.getDataOwnerLocal());
        dto.setDateCreated(metadata.getDateCreated());
        dto.setDescriptiveKeywords(metadata.getDescriptiveKeywords());
        dto.setLimitationsForSymphony(metadata.getLimitationsForSymphony());
        dto.setLineage(metadata.getLineage());
        dto.setMaintenanceInformation(metadata.getMaintenanceInformation());
        dto.setMapAcknowledgement(metadata.getMapAcknowledgement());
        dto.setMarinePlaneArea(metadata.getMarinePlaneArea());
        dto.setMetadataDate(metadata.getMetadataDate());
        dto.setMetadataEmail(metadata.getMetadataEmail());
        dto.setMetadataLanguage(metadata.getMetadataLanguage());
        dto.setMetadataOrganisation(metadata.getMetadataOrganisation());
        dto.setMetadataOrganisationLocal(metadata.getMetadataOrganisationLocal());
        dto.setOwnerEmail(metadata.getOwnerEmail());
        dto.setSummary(metadata.getSummary());
        dto.setSummaryLocal(metadata.getSummaryLocal());
        dto.setRecommendations(metadata.getRecommendations());
        dto.setStatus(metadata.getStatus());
        dto.setTopicCategory(metadata.getTopicCategory());
        dto.setTheme(metadata.getTheme());
        dto.setUseLimitations(metadata.getUseLimitations());
        dto.setOtherRestrictions(metadata.getOtherRestrictions());
        dto.setSecurityClassification(metadata.getSecurityClassification());
        dto.setSpatialPresentation(metadata.getSpatialRepresentation());
        dto.setRasterSpatialReferenceSystem(metadata.getRasterSpatialReferencesystem());
        dto.setSymphonyDataType(metadata.getSymphonyDataType());
        dto.setBandNumber(metadata.getBandNumber());
        return dto;
    }

}
