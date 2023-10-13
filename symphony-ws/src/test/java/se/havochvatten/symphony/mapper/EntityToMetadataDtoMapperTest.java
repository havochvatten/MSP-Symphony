package se.havochvatten.symphony.mapper;

import org.junit.Test;
import se.havochvatten.symphony.dto.MetadataPropertyDto;
import se.havochvatten.symphony.dto.MetadataSymphonyThemeDto;
import se.havochvatten.symphony.entity.Metadata;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;

public class EntityToMetadataDtoMapperTest {

    @Test
    public void testMapEntitiesToMetaDataThemeDto() {
        List<Metadata> metadataList = findMetadataList();
        MetadataSymphonyThemeDto metadataSymphonyThemeDto =
				EntityToMetadataDtoMapper.mapEntitiesToMetaDataThemeDto("Fish", metadataList);
        assertThat(metadataSymphonyThemeDto.getSymphonyThemeName(), is("Fish"));
        assertThat(metadataSymphonyThemeDto.getSymphonyThemeNameLocal(), is("Fisk"));
        assertThat(metadataSymphonyThemeDto.getProperties().size(), is(2));

        // properies
        MetadataPropertyDto propDto1 = metadataSymphonyThemeDto.getProperties().get(0);
        Metadata metadata1 = metadataList.get(0);
        Map<String, String> meta = propDto1.getMeta();
        assertThat(propDto1.getId(), is(metadata1.getId()));
        assertThat(propDto1.getTitle(), is(metadata1.getTitle()));
        assertThat(propDto1.getTitleLocal(), is(metadata1.getTitleLocal()));
        assertThat(propDto1.isDefaultSelected(), is(metadata1.isDefaultSelected()));
        assertThat(propDto1.getBandNumber(), is(metadata1.getBandNumber()));
        assertThat(meta.get("accessUseRestrictions"), is(metadata1.getAccessUseRestrictions()));
        assertThat(meta.get("authorEmail"), is(metadata1.getAuthorEmail()));
        assertThat(meta.get("authorOrganisation"), is(metadata1.getAuthorOrganisation()));
        assertThat(meta.get("rasterFileName"), is(metadata1.getRasterFileName()));
        assertThat(meta.get("metadataFileName"), is(metadata1.getMetadataFileName()));
        assertThat(meta.get("dataOwner"), is(metadata1.getDataOwner()));
        assertThat(meta.get("dataOwnerLocal"), is(metadata1.getDataOwnerLocal()));
        assertThat(meta.get("dateCreated"), is(metadata1.getDateCreated()));
        assertThat(meta.get("descriptiveKeywords"), is(metadata1.getDescriptiveKeywords()));
        assertThat(meta.get("limitationsForSymphony"), is(metadata1.getLimitationsForSymphony()));
        assertThat(meta.get("lineage"), is(metadata1.getLineage()));
        assertThat(meta.get("maintenanceInformation"), is(metadata1.getMaintenanceInformation()));
        assertThat(meta.get("mapAcknowledgement"), is(metadata1.getMapAcknowledgement()));
        assertThat(meta.get("marinePlaneArea"), is(metadata1.getMarinePlaneArea()));
        assertThat(meta.get("metadataDate"), is(metadata1.getMetadataDate()));
        assertThat(meta.get("metadataEmail"), is(metadata1.getMetadataEmail()));
        assertThat(meta.get("metadataLanguage"), is(metadata1.getMetadataLanguage()));
        assertThat(meta.get("metadataOrganisation"), is(metadata1.getMetadataOrganisation()));
        assertThat(meta.get("metadataOrganisationLocal"), is(metadata1.getMetadataOrganisationLocal()));
        assertThat(meta.get("ownerEmail"), is(metadata1.getOwnerEmail()));
        assertThat(meta.get("summary"), is(metadata1.getSummary()));
        assertThat(meta.get("summaryLocal"), is(metadata1.getSummaryLocal()));
        assertThat(meta.get("recommendations"), is(metadata1.getRecommendations()));
        assertThat(meta.get("status"), is(metadata1.getStatus()));
        assertThat(meta.get("topicCategory"), is(metadata1.getTopicCategory()));
        assertThat(meta.get("theme"), is(metadata1.getTheme()));
        assertThat(meta.get("useLimitations"), is(metadata1.getUseLimitations()));
        assertThat(meta.get("otherRestrictions"), is(metadata1.getOtherRestrictions()));
        assertThat(meta.get("securityClassification"), is(metadata1.getSecurityClassification()));
        assertThat(meta.get("spatialRepresentation"), is(metadata1.getSpatialRepresentation()));
        assertThat(meta.get("rasterSpatialReferencesystem"),
            is(metadata1.getRasterSpatialReferencesystem()));
        assertThat(meta.get("symphonyDataType"), is(metadata1.getSymphonyDataType()));
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
        metaData.setSymphonyTheme("Fish");
        metaData.setSymphonyThemeLocal("Fisk");
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
