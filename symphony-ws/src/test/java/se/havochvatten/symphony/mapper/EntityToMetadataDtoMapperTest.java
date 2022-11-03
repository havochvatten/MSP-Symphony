package se.havochvatten.symphony.mapper;

import org.junit.Test;
import se.havochvatten.symphony.dto.MetadataPropertyDto;
import se.havochvatten.symphony.dto.MetadataSymphonyTeamDto;
import se.havochvatten.symphony.entity.Metadata;

import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;

public class EntityToMetadataDtoMapperTest {

    @Test
    public void testMapEnitiesToMetaDataTeamDto() {
        List<Metadata> metadataList = findMetadataList();
        MetadataSymphonyTeamDto metadataSymphonyTeamDto =
				EntityToMetadataDtoMapper.mapEnitiesToMetaDataTeamDto("Fish", metadataList);
        assertThat(metadataSymphonyTeamDto.getSymphonyTeamName(), is("Fish"));
        assertThat(metadataSymphonyTeamDto.getSymphonyTeamNameLocal(), is("Fisk"));
        assertThat(metadataSymphonyTeamDto.getProperties().size(), is(2));

        // properies
        MetadataPropertyDto propDto1 = metadataSymphonyTeamDto.getProperties().get(0);
        Metadata metadata1 = metadataList.get(0);
        assertThat(propDto1.getId(), is(metadata1.getId()));
        assertThat(propDto1.getTitle(), is(metadata1.getTitle()));
        assertThat(propDto1.getTitleLocal(), is(metadata1.getTitleLocal()));
        assertThat(propDto1.isDefaultSelected(), is(metadata1.isDefaultSelected()));
        assertThat(propDto1.getAccessUserRestrictions(), is(metadata1.getAccessUseRestrictions()));
        assertThat(propDto1.getAuthorEmail(), is(metadata1.getAuthorEmail()));
        assertThat(propDto1.getAuthorOrganisation(), is(metadata1.getAuthorOrganisation()));
        assertThat(propDto1.getRasterFileName(), is(metadata1.getRasterFileName()));
        assertThat(propDto1.getMetadataFileName(), is(metadata1.getMetadataFileName()));
        assertThat(propDto1.getDataOwner(), is(metadata1.getDataOwner()));
        assertThat(propDto1.getDataOwnerLocal(), is(metadata1.getDataOwnerLocal()));
        assertThat(propDto1.getDateCreated(), is(metadata1.getDateCreated()));
        assertThat(propDto1.getDescriptiveKeywords(), is(metadata1.getDescriptiveKeywords()));
        assertThat(propDto1.getLimitationsForSymphony(), is(metadata1.getLimitationsForSymphony()));
        assertThat(propDto1.getLineage(), is(metadata1.getLineage()));
        assertThat(propDto1.getMaintenanceInformation(), is(metadata1.getMaintenanceInformation()));
        assertThat(propDto1.getMapAcknowledgement(), is(metadata1.getMapAcknowledgement()));
        assertThat(propDto1.getMarinePlaneArea(), is(metadata1.getMarinePlaneArea()));
        assertThat(propDto1.getMetadataDate(), is(metadata1.getMetadataDate()));
        assertThat(propDto1.getMetadataEmail(), is(metadata1.getMetadataEmail()));
        assertThat(propDto1.getMetadataLanguage(), is(metadata1.getMetadataLanguage()));
        assertThat(propDto1.getMetadataOrganisation(), is(metadata1.getMetadataOrganisation()));
        assertThat(propDto1.getMetadataOrganisationLocal(), is(metadata1.getMetadataOrganisationLocal()));
        assertThat(propDto1.getOwnerEmail(), is(metadata1.getOwnerEmail()));
        assertThat(propDto1.getSummary(), is(metadata1.getSummary()));
        assertThat(propDto1.getSummaryLocal(), is(metadata1.getSummaryLocal()));
        assertThat(propDto1.getRecommendations(), is(metadata1.getRecommendations()));
        assertThat(propDto1.getStatus(), is(metadata1.getStatus()));
        assertThat(propDto1.getTopicCategory(), is(metadata1.getTopicCategory()));
        assertThat(propDto1.getTheme(), is(metadata1.getTheme()));
        assertThat(propDto1.getUseLimitations(), is(metadata1.getUseLimitations()));
        assertThat(propDto1.getOtherRestrictions(), is(metadata1.getOtherRestrictions()));
        assertThat(propDto1.getSecurityClassification(), is(metadata1.getSecurityClassification()));
        assertThat(propDto1.getSpatialPresentation(), is(metadata1.getSpatialRepresentation()));
        assertThat(propDto1.getRasterSpatialReferenceSystem(),
				is(metadata1.getRasterSpatialReferencesystem()));
        assertThat(propDto1.getSymphonyDataType(), is(metadata1.getSymphonyDataType()));
        assertThat(propDto1.getBandNumber(), is(metadata1.getBandNumber()));
    }

    private List<Metadata> findMetadataList() {
        List<Metadata> metadataList = new ArrayList<>();
        metadataList.add(getMetaData(1));
        metadataList.add(getMetaData(2));
        return metadataList;
    }

    private Metadata getMetaData(int sufix) {
        Metadata metaData = new Metadata();
        metaData.setId(123);
        metaData.setSymphonyTeam("Fish");
        metaData.setSymphonyTeamLocal("Fisk");
        metaData.setTitle("title" + sufix);
        metaData.setTitleLocal("titleLocal" + sufix);
        metaData.setDefaultSelected(true);
        metaData.setAccessUseRestrictions("accessUseRestrictions" + sufix);
        metaData.setAuthorEmail("authorEmail" + sufix);
        metaData.setAuthorOrganisation("authorOrganisation" + sufix);
        metaData.setDataOwner("dataOwner" + sufix);
        metaData.setDataOwnerLocal("dataOwnerLocal" + sufix);
        metaData.setDateCreated("DateCreated" + sufix);
        metaData.setDatePublished("datePublished" + sufix);
        metaData.setDescriptiveKeywords("descriptiveKeywords" + sufix);
        metaData.setFormat("format" + sufix);
        metaData.setLimitationsForSymphony("limitationsForSymphony" + sufix);
        metaData.setLineage("lineage" + sufix);
        metaData.setMaintenanceInformation("MaintenanceInformation" + sufix);
        metaData.setMapAcknowledgement("mapAcknowledgement" + sufix);
        metaData.setMarinePlaneArea("marinePlaneArea" + sufix);
        metaData.setMetadataDate("metadataDate" + sufix);
        metaData.setMetadataEmail("metadataEmail" + sufix);
        metaData.setMetadataFileName("metadataFileName" + sufix);
        metaData.setMetadataLanguage("metadataLanguage" + sufix);
        metaData.setMetadataOrganisation("metadataOrganisation" + sufix);
        metaData.setMetadataOrganisationLocal("metadataOrganisationLocal" + sufix);
        metaData.setOtherRestrictions("otherRestrictions" + sufix);
        metaData.setOwnerEmail("ownerEmail" + sufix);
        metaData.setRasterFileName("rasterFileName" + sufix);
        metaData.setRasterSpatialReferencesystem("rasterSpatialReferencesystem" + sufix);
        metaData.setRecommendations("recommendations" + sufix);
        metaData.setResourceType("resourceType" + sufix);
        metaData.setResourceType("resourceType" + sufix);
        metaData.setSecurityClassification("securityClassification" + sufix);
        metaData.setSpatialRepresentation("spatialRepresentation" + sufix);
        metaData.setStatus("status" + sufix);
        metaData.setSummary("summary" + sufix);
        metaData.setSummaryLocal("summaryLocal" + sufix);
        metaData.setSymphonyDataType("symphonyDataType" + sufix);
        metaData.setTemporalPeriod("temporalPeriod" + sufix);
        metaData.setTheme("theme" + sufix);
        metaData.setTopicCategory("topicCategory" + sufix);
        metaData.setUseLimitations("useLimitations" + sufix);
        metaData.setBandNumber(1);
        return metaData;
    }

}
