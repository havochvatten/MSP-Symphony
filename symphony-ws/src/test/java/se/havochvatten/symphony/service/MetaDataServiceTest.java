package se.havochvatten.symphony.service;

import org.junit.Test;
import org.mockito.Mockito;
import se.havochvatten.symphony.dto.MetadataComponentDto;
import se.havochvatten.symphony.entity.Metadata;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.Matchers.anyObject;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class MetaDataServiceTest {
    MetaDataService metaDataService = new MetaDataService();

    @Test
    public void testFindMetadata() {
        metaDataService.em = mock(EntityManager.class);
        List<String> symphonyThemes = new ArrayList<>();
        int baselineVersionId = 1;

        symphonyThemes.add("Fish");
        symphonyThemes.add("Bird");
        Query mockedQuery = mock(Query.class);
        when(metaDataService.em.createQuery("Select o.symphonyTheme from Metadata o where o.symphonyCategory" +
				" = :categ AND o.baselineVersion.id = :baselineVersionId")).thenReturn(mockedQuery);
        when(mockedQuery.setParameter(anyString(), anyObject())).thenReturn(mockedQuery);
        when(mockedQuery.setParameter("baselineVersionId", baselineVersionId)).thenReturn(mockedQuery);
        when(mockedQuery.getResultList()).thenReturn(symphonyThemes);

        List<Metadata> themeMetaDataFish = new ArrayList<>();
        Metadata metadataFish = new Metadata();
        metadataFish.setSymphonyThemeLocal("Fisk");
        metadataFish.setTitle("Cod");
        themeMetaDataFish.add(metadataFish);

        List<Metadata> themeMetaDataBird = new ArrayList<>();
        Metadata metadataBird = new Metadata();
        metadataBird.setSymphonyThemeLocal("Fågel");
        metadataBird.setTitle("Coastal bird");
        metadataBird.setTitleLocal("Kustfågel");
        themeMetaDataBird.add(metadataBird);

        MetaDataService metaDataServiceSpy = Mockito.spy(metaDataService);
        Mockito.doReturn(themeMetaDataBird).when(metaDataServiceSpy).getSymphonyThemeMetaData("Ecosystem",
				"Bird", baselineVersionId);
        Mockito.doReturn(themeMetaDataFish).when(metaDataServiceSpy).getSymphonyThemeMetaData("Ecosystem",
				"Fish", baselineVersionId);

        MetadataComponentDto metadataComponentDto = metaDataServiceSpy.getComponentDto("Ecosystem",
				baselineVersionId);
        assertThat(metadataComponentDto.getSymphonyThemes().size(), is(2));
        assertThat(metadataComponentDto.getSymphonyThemes().get(0).getSymphonyThemeName(), is("Bird"));
        assertThat(metadataComponentDto.getSymphonyThemes().get(0).getSymphonyThemeNameLocal(), is("Fågel"));
        assertThat(metadataComponentDto.getSymphonyThemes().get(0).getProperties().get(0).getTitle(), is("Coastal bird"));
        assertThat(metadataComponentDto.getSymphonyThemes().get(0).getProperties().get(0).getTitleLocal(), is("Kustfågel"));
    }
}
