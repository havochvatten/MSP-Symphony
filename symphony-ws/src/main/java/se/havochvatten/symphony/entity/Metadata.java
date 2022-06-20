package se.havochvatten.symphony.entity;

import javax.persistence.*;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlTransient;
import java.io.Serializable;
import java.util.List;

@Entity
@Table(name = "metadata")
@NamedQueries({
		@NamedQuery(name = "Metadata.findAll", query = "SELECT m FROM Metadata m"),
		@NamedQuery(name = "Metadata.findByMetadatafilename", query = "SELECT m FROM Metadata m WHERE m" +
				".metadataFileName = :metadataFilename"),
		@NamedQuery(name = "Metadata.findByRasterfilename", query = "SELECT m FROM Metadata m WHERE m" +
				".rasterFileName = :rasterFilename"),
		@NamedQuery(name = "Metadata.findBySymphonycategory", query = "SELECT m FROM Metadata m WHERE m" +
				".symphonyCategory = :symphonyCategory"),
		@NamedQuery(name = "Metadata.findBySymphonyteam", query = "SELECT m FROM Metadata m WHERE m" +
				".symphonyTeam = :symphonyTeam"),
		@NamedQuery(name = "Metadata.findBySymphonyteamlocal", query = "SELECT m FROM Metadata m WHERE m" +
				".symphonyTeamLocal = :symphonyTeamLocal"),
		@NamedQuery(name = "Metadata.findById", query = "SELECT m FROM Metadata m WHERE m.id = :id")})
public class Metadata implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @Basic(optional = false)
    @SequenceGenerator(name = "meta_seq", sequenceName = "meta_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "meta_seq")
    @Column(name = "meta_id")
    private Integer id;

    @Column(name = "meta_bandnumber")
    private int bandNumber;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "presMetadata")
    private List<Sensitivity> pressureSensitivities;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "ecoMetadata")
    private List<Sensitivity> ecoSensitivities;

    @Size(max = 2147483647)
    @Column(name = "meta_metadatafilename")
    private String metadataFileName;
    @Size(max = 2147483647)
    @Column(name = "meta_rasterfilename")
    private String rasterFileName;
    @Size(max = 2147483647)
    @Column(name = "meta_symphonycategory")
    private String symphonyCategory;
    @Size(max = 2147483647)
    @Column(name = "meta_symphonyteam")
    private String symphonyTeam;
    @Size(max = 2147483647)
    @Column(name = "meta_symphonyteamlocal")
    private String symphonyTeamLocal;
    @Size(max = 2147483647)
    @Column(name = "meta_symphonydatatype")
    private String symphonyDataType;
    @Size(max = 2147483647)
    @Column(name = "meta_marineplanearea")
    private String marinePlaneArea;
    @Size(max = 2147483647)
    @Column(name = "meta_title")
    private String title;
    @Size(max = 2147483647)
    @Column(name = "meta_titlelocal")
    private String titleLocal;
    @Size(max = 2147483647)
    @Column(name = "meta_datecreated")
    private String dateCreated;
    @Size(max = 2147483647)
    @Column(name = "meta_datepublished")
    private String datePublished;
    @Size(max = 2147483647)
    @Column(name = "meta_resourcetype")
    private String resourceType;
    @Size(max = 2147483647)
    @Column(name = "meta_format")
    private String format;
    @Size(max = 2147483647)
    @Column(name = "meta_summary")
    private String summary;
    @Size(max = 2147483647)
    @Column(name = "meta_summarylocal")
    private String summaryLocal;
    @Size(max = 2147483647)
    @Column(name = "meta_limitationsforsymphony")
    private String limitationsForSymphony;
    @Size(max = 2147483647)
    @Column(name = "meta_recommendations")
    private String recommendations;
    @Size(max = 2147483647)
    @Column(name = "meta_lineage")
    private String lineage;
    @Size(max = 2147483647)
    @Column(name = "meta_status")
    private String status;
    @Size(max = 2147483647)
    @Column(name = "meta_authororganisation")
    private String authorOrganisation;
    @Size(max = 2147483647)
    @Column(name = "meta_authoremail")
    private String authorEmail;
    @Size(max = 2147483647)
    @Column(name = "meta_dataowner")
    private String dataOwner;
    @Size(max = 2147483647)
    @Column(name = "meta_dataownerlocal")
    private String dataOwnerLocal;
    @Size(max = 2147483647)
    @Column(name = "meta_owneremail")
    private String ownerEmail;
    @Size(max = 2147483647)
    @Column(name = "meta_topiccategory")
    private String topicCategory;
    @Size(max = 2147483647)
    @Column(name = "meta_descriptivekeywords")
    private String descriptiveKeywords;
    @Size(max = 2147483647)
    @Column(name = "meta_theme")
    private String theme;
    @Size(max = 2147483647)
    @Column(name = "meta_temporalperiod")
    private String temporalPeriod;
    @Size(max = 2147483647)
    @Column(name = "meta_uselimitations")
    private String useLimitations;
    @Size(max = 2147483647)
    @Column(name = "meta_accessuserestrictions")
    private String accessUseRestrictions;
    @Size(max = 2147483647)
    @Column(name = "meta_otherrestrictions")
    private String otherRestrictions;
    @Size(max = 2147483647)
    @Column(name = "meta_mapacknowledgement")
    private String mapAcknowledgement;
    @Size(max = 2147483647)
    @Column(name = "meta_securityclassification")
    private String securityClassification;
    @Size(max = 2147483647)
    @Column(name = "meta_maintenanceinformation")
    private String maintenanceInformation;
    @Size(max = 2147483647)
    @Column(name = "meta_spatialrepresentation")
    private String spatialRepresentation;
    @Size(max = 2147483647)
    @Column(name = "meta_rasterspatialreferencesystem")
    private String rasterSpatialReferencesystem;
    @Size(max = 2147483647)
    @Column(name = "meta_metadatadate")
    private String metadataDate;
    @Size(max = 2147483647)
    @Column(name = "meta_metadataorganisation")
    private String metadataOrganisation;
    @Size(max = 2147483647)
    @Column(name = "meta_metadataorganisationlocal")
    private String metadataOrganisationLocal;
    @Size(max = 2147483647)
    @Column(name = "meta_metadataemail")
    private String metadataEmail;
    @Size(max = 2147483647)
    @Column(name = "meta_metadatalanguage")
    private String metadataLanguage;
    @JoinColumn(name = "meta_bver_id", referencedColumnName = "bver_id")
    @ManyToOne(optional = false)
    private BaselineVersion baselineVersion;
    @Column(name = "meta_defaultselected")
    private boolean defaultSelected;


    public Metadata() {
    }

    public String getMetadataFileName() {
        return metadataFileName;
    }

    public void setMetadataFileName(String metadataFileName) {
        this.metadataFileName = metadataFileName;
    }

    public String getRasterFileName() {
        return rasterFileName;
    }

    public void setRasterFileName(String rasterFileName) {
        this.rasterFileName = rasterFileName;
    }

    public String getSymphonyCategory() {
        return symphonyCategory;
    }

    public void setSymphonyCategory(String symphonyCategory) {
        this.symphonyCategory = symphonyCategory;
    }

    public String getSymphonyTeam() {
        return symphonyTeam;
    }

    public void setSymphonyTeam(String symphonyTeam) {
        this.symphonyTeam = symphonyTeam;
    }

    public String getSymphonyTeamLocal() {
        return symphonyTeamLocal;
    }

    public void setSymphonyTeamLocal(String symphonyTeamLocal) {
        this.symphonyTeamLocal = symphonyTeamLocal;
    }

    public String getSymphonyDataType() {
        return symphonyDataType;
    }

    public void setSymphonyDataType(String symphonyDataType) {
        this.symphonyDataType = symphonyDataType;
    }

    public String getMarinePlaneArea() {
        return marinePlaneArea;
    }

    public void setMarinePlaneArea(String marinePlaneArea) {
        this.marinePlaneArea = marinePlaneArea;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTitleLocal() {
        return titleLocal;
    }

    public void setTitleLocal(String titleLocal) {
        this.titleLocal = titleLocal;
    }

    public String getDateCreated() {
        return dateCreated;
    }

    public void setDateCreated(String dateCreated) {
        this.dateCreated = dateCreated;
    }

    public String getDatePublished() {
        return datePublished;
    }

    public void setDatePublished(String datePublished) {
        this.datePublished = datePublished;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }


    public String getLimitationsForSymphony() {
        return limitationsForSymphony;
    }

    public void setLimitationsForSymphony(String limitationsForSymphony) {
        this.limitationsForSymphony = limitationsForSymphony;
    }

    public String getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(String recommendations) {
        this.recommendations = recommendations;
    }

    public String getLineage() {
        return lineage;
    }

    public void setLineage(String lineage) {
        this.lineage = lineage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAuthorOrganisation() {
        return authorOrganisation;
    }

    public void setAuthorOrganisation(String authorOrganisation) {
        this.authorOrganisation = authorOrganisation;
    }

    public String getAuthorEmail() {
        return authorEmail;
    }

    public void setAuthorEmail(String authorEmail) {
        this.authorEmail = authorEmail;
    }

    public String getDataOwner() {
        return dataOwner;
    }

    public void setDataOwner(String dataOwner) {
        this.dataOwner = dataOwner;
    }

    public String getDataOwnerLocal() {
        return dataOwnerLocal;
    }

    public void setDataOwnerLocal(String dataOwnerLocal) {
        this.dataOwnerLocal = dataOwnerLocal;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public String getTopicCategory() {
        return topicCategory;
    }

    public void setTopicCategory(String topicCategory) {
        this.topicCategory = topicCategory;
    }

    public String getDescriptiveKeywords() {
        return descriptiveKeywords;
    }

    public void setDescriptiveKeywords(String descriptiveKeywords) {
        this.descriptiveKeywords = descriptiveKeywords;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getTemporalPeriod() {
        return temporalPeriod;
    }

    public void setTemporalPeriod(String temporalPeriod) {
        this.temporalPeriod = temporalPeriod;
    }

    public String getUseLimitations() {
        return useLimitations;
    }

    public void setUseLimitations(String useLimitations) {
        this.useLimitations = useLimitations;
    }

    public String getAccessUseRestrictions() {
        return accessUseRestrictions;
    }

    public void setAccessUseRestrictions(String accessUseRestrictions) {
        this.accessUseRestrictions = accessUseRestrictions;
    }

    public String getOtherRestrictions() {
        return otherRestrictions;
    }

    public void setOtherRestrictions(String otherRestrictions) {
        this.otherRestrictions = otherRestrictions;
    }

    public String getMapAcknowledgement() {
        return mapAcknowledgement;
    }

    public void setMapAcknowledgement(String mapAcknowledgement) {
        this.mapAcknowledgement = mapAcknowledgement;
    }

    public String getSecurityClassification() {
        return securityClassification;
    }

    public void setSecurityClassification(String securityClassification) {
        this.securityClassification = securityClassification;
    }

    public String getMaintenanceInformation() {
        return maintenanceInformation;
    }

    public void setMaintenanceInformation(String maintenanceInformation) {
        this.maintenanceInformation = maintenanceInformation;
    }

    public String getSpatialRepresentation() {
        return spatialRepresentation;
    }

    public void setSpatialRepresentation(String spatialRepresentation) {
        this.spatialRepresentation = spatialRepresentation;
    }

    public String getRasterSpatialReferencesystem() {
        return rasterSpatialReferencesystem;
    }

    public void setRasterSpatialReferencesystem(String rasterSpatialReferencesystem) {
        this.rasterSpatialReferencesystem = rasterSpatialReferencesystem;
    }

    public String getMetadataDate() {
        return metadataDate;
    }

    public void setMetadataDate(String metadataDate) {
        this.metadataDate = metadataDate;
    }

    public String getMetadataOrganisation() {
        return metadataOrganisation;
    }

    public void setMetadataOrganisation(String metadataOrganisation) {
        this.metadataOrganisation = metadataOrganisation;
    }

    public String getMetadataOrganisationLocal() {
        return metadataOrganisationLocal;
    }

    public void setMetadataOrganisationLocal(String metadataOrganisationLocal) {
        this.metadataOrganisationLocal = metadataOrganisationLocal;
    }

    public String getMetadataEmail() {
        return metadataEmail;
    }

    public void setMetadataEmail(String metadataEmail) {
        this.metadataEmail = metadataEmail;
    }

    public String getMetadataLanguage() {
        return metadataLanguage;
    }

    public void setMetadataLanguage(String metadataLanguage) {
        this.metadataLanguage = metadataLanguage;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getSummaryLocal() {
        return summaryLocal;
    }

    public void setSummaryLocal(String summaryLocal) {
        this.summaryLocal = summaryLocal;
    }

    public int getBandNumber() {
        return bandNumber;
    }

    public void setBandNumber(int bandnumber) {
        this.bandNumber = bandnumber;
    }

    @XmlTransient
    public List<Sensitivity> getPressureSensitivities() {
        return pressureSensitivities;
    }

    public void setPressureSensitivities(List<Sensitivity> pressureSensitivities) {
        this.pressureSensitivities = pressureSensitivities;
    }

    @XmlTransient
    public List<Sensitivity> getEcoSensitivities() {
        return ecoSensitivities;
    }

    public void setEcoSensitivities(List<Sensitivity> ecoSensitivities) {
        this.ecoSensitivities = ecoSensitivities;
    }

    public BaselineVersion getBaselineVersion() {
        return baselineVersion;
    }

    public void setBaselineVersion(BaselineVersion baselineVersion) {
        this.baselineVersion = baselineVersion;
    }

    public boolean isDefaultSelected() {
        return defaultSelected;
    }

    public void setDefaultSelected(boolean defaultselected) {
        this.defaultSelected = defaultselected;
    }


    @Override
    public String toString() {
        return "se.havochvatten.symphonyws.entity.Metadata[ id=" + id + " ]";
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Metadata)) {
            return false;
        }
        Metadata other = (Metadata) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }
}
