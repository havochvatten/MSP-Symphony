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
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class MetaDataServiceTest {
    MetaDataService metaDataService = new MetaDataService();

    @Test
    public void testFindMetadata() {
        metaDataService.em = mock(EntityManager.class);
        List<String> symphonyTeams = new ArrayList<>();
        int baselineVersionId = 1;

        symphonyTeams.add("Fish");
        symphonyTeams.add("Bird");
        Query mockedQuery = mock(Query.class);
        when(metaDataService.em.createQuery("Select o.symphonyTeam from Metadata o where o.symphonyCategory" +
				" = :categ AND o.baselineVersion.id = :baselineVersionId")).thenReturn(mockedQuery);
        when(mockedQuery.setParameter(anyString(), anyObject())).thenReturn(mockedQuery);
        when(mockedQuery.setParameter("baselineVersionId", baselineVersionId)).thenReturn(mockedQuery);
        when(mockedQuery.getResultList()).thenReturn(symphonyTeams);

        List<Metadata> teamMetaDataFish = new ArrayList<>();
        Metadata metadataFish = new Metadata();
        metadataFish.setSymphonyTeamLocal("Fisk");
        metadataFish.setTitle("Cod");
        teamMetaDataFish.add(metadataFish);

        List<Metadata> teamMetaDataBird = new ArrayList<>();
        Metadata metadataBird = new Metadata();
        metadataBird.setSymphonyTeamLocal("Fågel");
        metadataBird.setTitle("Coastal bird");
        metadataBird.setTitleLocal("Kustfågel");
        teamMetaDataBird.add(metadataBird);

        MetaDataService metaDataServiceSpy = Mockito.spy(metaDataService);
        Mockito.doReturn(teamMetaDataBird).when(metaDataServiceSpy).getSymphonyTeamMetaData("Ecosystem",
				"Bird", baselineVersionId);
        Mockito.doReturn(teamMetaDataFish).when(metaDataServiceSpy).getSymphonyTeamMetaData("Ecosystem",
				"Fish", baselineVersionId);

        MetadataComponentDto metadataComponentDto = metaDataServiceSpy.getComponentDto("Ecosystem",
				baselineVersionId);
        assertThat(metadataComponentDto.getSymphonyTeams().size(), is(2));
        assertThat(metadataComponentDto.getSymphonyTeams().get(0).getSymphonyTeamName(), is("Bird"));
        assertThat(metadataComponentDto.getSymphonyTeams().get(0).getSymphonyTeamNameLocal(), is("Fågel"));
        assertThat(metadataComponentDto.getSymphonyTeams().get(0).getProperties().get(0).getTitle(), is("Coastal bird"));
        assertThat(metadataComponentDto.getSymphonyTeams().get(0).getProperties().get(0).getTitleLocal(), is("Kustfågel"));
    }
}
