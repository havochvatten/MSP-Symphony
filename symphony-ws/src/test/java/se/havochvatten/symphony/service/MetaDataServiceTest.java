package se.havochvatten.symphony.service;

import org.junit.Test;
import org.mockito.Mockito;
import se.havochvatten.symphony.dto.MetadataComponentDto;
import se.havochvatten.symphony.entity.BaselineVersion;
import se.havochvatten.symphony.entity.Metadata;
import se.havochvatten.symphony.entity.SymphonyBand;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.TypedQuery;

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
        List<SymphonyBand> symphonyThemes = new ArrayList<>();
        List<Metadata> metadataENList = new ArrayList<>();
        List<Metadata> metadataSVList = new ArrayList<>();

        TypedQuery<SymphonyBand> mockedBandQuery = mock(TypedQuery.class);
        TypedQuery<Metadata> mockedMetadataQuery = mock(TypedQuery.class);
        when(metaDataService.em.createQuery(
            "SELECT b FROM SymphonyBand b " +
            "WHERE b.baseline.id = :baselineVersionId " +
            "AND b.category = :category", SymphonyBand.class))
            .thenReturn(mockedBandQuery);

        when(mockedBandQuery.setParameter(anyString(), anyObject())).thenReturn(mockedBandQuery);
        when(mockedBandQuery.setParameter("baselineVersionId", 1)).thenReturn(mockedBandQuery);
        when(mockedBandQuery.setParameter("category", "Ecosystem")).thenReturn(mockedBandQuery);
        when(mockedBandQuery.getResultList()).thenReturn(symphonyThemes);

        when(metaDataService.em.createQuery(MetaDataService.sparseMetaQuery, Metadata.class)).thenReturn(mockedMetadataQuery);
        when(mockedMetadataQuery.setParameter(anyString(), anyObject())).thenReturn(mockedMetadataQuery);
        when(mockedMetadataQuery.setParameter("bandsList", symphonyThemes)).thenReturn(mockedMetadataQuery);
        when(mockedMetadataQuery.setParameter("language", "en")).thenReturn(mockedMetadataQuery);
        when(mockedMetadataQuery.getResultList()).thenReturn(metadataENList, metadataSVList);

        int baselineVersionId = 1;

        BaselineVersion exmBaselineVersion = new BaselineVersion();
        exmBaselineVersion.setId(baselineVersionId);
        exmBaselineVersion.setName("Example baseline version");

        SymphonyBand fish1Band = new SymphonyBand();
        fish1Band.setCategory("Ecosystem");
        fish1Band.setBaseline(exmBaselineVersion);
        fish1Band.setBandNumber(3);

        SymphonyBand fish2Band = new SymphonyBand();
        fish2Band.setCategory("Ecosystem");
        fish2Band.setBaseline(exmBaselineVersion);
        fish2Band.setBandNumber(13);

        SymphonyBand birdBand = new SymphonyBand();
        birdBand.setCategory("Ecosystem");
        birdBand.setBaseline(exmBaselineVersion);
        birdBand.setBandNumber(25);

        Metadata fish1ThemeEN = new Metadata();
        fish1ThemeEN.setLanguage("en");
        fish1ThemeEN.setMetaField("symphonytheme");
        fish1ThemeEN.setMetaValue("Fish");
        fish1ThemeEN.setBand(fish1Band);

        Metadata fish1TitleEN = new Metadata();
        fish1TitleEN.setLanguage("en");
        fish1TitleEN.setMetaField("title");
        fish1TitleEN.setMetaValue("Cod");
        fish1TitleEN.setBand(fish1Band);

        Metadata fish1ThemeSV = new Metadata();
        fish1ThemeSV.setLanguage("sv");
        fish1ThemeSV.setMetaField("symphonytheme");
        fish1ThemeSV.setMetaValue("Fisk");
        fish1ThemeSV.setBand(fish1Band);

        Metadata fish1TitleSV = new Metadata();
        fish1TitleSV.setLanguage("sv");
        fish1TitleSV.setMetaField("title");
        fish1TitleSV.setMetaValue("Torsk");
        fish1TitleSV.setBand(fish1Band);

        Metadata fish2ThemeEN = new Metadata();
        fish2ThemeEN.setLanguage("en");
        fish2ThemeEN.setMetaField("symphonytheme");
        fish2ThemeEN.setMetaValue("Fish");
        fish2ThemeEN.setBand(fish2Band);

        Metadata fish2TitleEN = new Metadata();
        fish2TitleEN.setLanguage("en");
        fish2TitleEN.setMetaField("title");
        fish2TitleEN.setMetaValue("Herring");
        fish2TitleEN.setBand(fish2Band);

        Metadata fish2ThemeSV = new Metadata();
        fish2ThemeSV.setLanguage("sv");
        fish2ThemeSV.setMetaField("symphonytheme");
        fish2ThemeSV.setMetaValue("Fisk");
        fish2ThemeSV.setBand(fish2Band);

        Metadata fish2TitleSV = new Metadata();
        fish2TitleSV.setLanguage("sv");
        fish2TitleSV.setMetaField("title");
        fish2TitleSV.setMetaValue("Sill");
        fish2TitleSV.setBand(fish2Band);

        Metadata birdThemeEN = new Metadata();
        birdThemeEN.setLanguage("en");
        birdThemeEN.setMetaField("symphonytheme");
        birdThemeEN.setMetaValue("Bird");
        birdThemeEN.setBand(birdBand);

        Metadata birdTitleEN = new Metadata();
        birdTitleEN.setLanguage("en");
        birdTitleEN.setMetaField("title");
        birdTitleEN.setMetaValue("Seabird coastal wintering");
        birdTitleEN.setBand(birdBand);

        Metadata birdThemeSV = new Metadata();
        birdThemeSV.setLanguage("sv");
        birdThemeSV.setMetaField("symphonytheme");
        birdThemeSV.setMetaValue("Fågel");
        birdThemeSV.setBand(birdBand);

        Metadata birdTitleSV = new Metadata();
        birdTitleSV.setLanguage("sv");
        birdTitleSV.setMetaField("title");
        birdTitleSV.setMetaValue("Sjöfågel övervintringsområde kust");
        birdTitleSV.setBand(birdBand);

        fish1Band.getMetaValues().add(fish1ThemeEN);
        fish1Band.getMetaValues().add(fish1TitleEN);
        fish1Band.getMetaValues().add(fish1ThemeSV);
        fish1Band.getMetaValues().add(fish1TitleSV);

        fish2Band.getMetaValues().add(fish2ThemeEN);
        fish2Band.getMetaValues().add(fish2TitleEN);
        fish2Band.getMetaValues().add(fish2ThemeSV);
        fish2Band.getMetaValues().add(fish2TitleSV);

        birdBand.getMetaValues().add(birdThemeEN);
        birdBand.getMetaValues().add(birdTitleEN);
        birdBand.getMetaValues().add(birdThemeSV);
        birdBand.getMetaValues().add(birdTitleSV);

        symphonyThemes.add(fish1Band);
        symphonyThemes.add(fish2Band);
        symphonyThemes.add(birdBand);

        metadataENList.add(fish1ThemeEN);
        metadataENList.add(fish1TitleEN);
        metadataENList.add(fish2ThemeEN);
        metadataENList.add(fish2TitleEN);

        metadataENList.add(birdThemeEN);
        metadataENList.add(birdTitleEN);

        metadataSVList.add(fish1ThemeSV);
        metadataSVList.add(fish1TitleSV);
        metadataSVList.add(fish2ThemeSV);
        metadataSVList.add(fish2TitleSV);

        metadataSVList.add(birdThemeSV);
        metadataSVList.add(birdTitleSV);

        MetaDataService metaDataServiceSpy = Mockito.spy(metaDataService);
        MetadataComponentDto metadataComponentDtoEN = metaDataServiceSpy.getComponentDto("Ecosystem",
            baselineVersionId, "en", true);

        MetadataComponentDto metadataComponentDtoSV = metaDataServiceSpy.getComponentDto("Ecosystem",
            baselineVersionId, "sv", true);

        assertThat(metadataComponentDtoEN.getSymphonyThemes().size(), is(2));
        assertThat(metadataComponentDtoEN.getSymphonyThemes().get(0).getSymphonyThemeName(), is("Bird"));
        assertThat(metadataComponentDtoEN.getSymphonyThemes().get(0).getBands().size(), is(1));
        assertThat(metadataComponentDtoEN.getSymphonyThemes().get(0).getBands().get(0).getTitle(), is("Seabird coastal wintering"));

        assertThat(metadataComponentDtoSV.getSymphonyThemes().size(), is(2));
        assertThat(metadataComponentDtoSV.getSymphonyThemes().get(1).getSymphonyThemeName(), is("Fågel"));
        assertThat(metadataComponentDtoSV.getSymphonyThemes().get(1).getBands().size(), is(1));
        assertThat(metadataComponentDtoSV.getSymphonyThemes().get(1).getBands().get(0).getTitle(), is("Sjöfågel övervintringsområde kust"));
    }
}
