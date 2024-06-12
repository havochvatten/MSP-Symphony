package se.havochvatten.symphony.service;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.geotools.data.geojson.GeoJSONWriter;
import org.geotools.data.simple.SimpleFeatureReader;
import org.geotools.geometry.jts.JTS;
import org.geotools.geopkg.FeatureEntry;
import org.geotools.geopkg.GeoPackage;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.locationtech.jts.geom.Geometry;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.sqlite.SQLiteException;
import se.havochvatten.symphony.dto.AreaImportResponse;
import se.havochvatten.symphony.dto.UploadedUserDefinedAreaDto;
import se.havochvatten.symphony.dto.UserDefinedAreaDto;
import se.havochvatten.symphony.dto.UserDto;
import se.havochvatten.symphony.entity.UserDefinedArea;
import se.havochvatten.symphony.entity.UserSettings;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.mapper.UserDefinedAreaDtoMapper;

import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.io.File;
import java.io.IOException;
import java.security.Principal;
import java.util.ArrayList; 
import java.util.List;
import java.util.Map;

@Stateless
public class UserService {
    private static final Logger LOG = LoggerFactory.getLogger(UserService.class);

    @PersistenceContext(unitName = "symphonyPU")
    private EntityManager em;
    private static final ObjectMapper mapper = new ObjectMapper();

    /**
     * Find all user defined areas
     */
    public List<UserDefinedAreaDto> findAllUserDefinedAreasByOwner(Principal principal) throws SymphonyStandardAppException {
        List<UserDefinedArea> userDefinedAreas = em.createNamedQuery("UserDefinedArea.findAllByOwner")
                .setParameter("owner", principal.getName())
                .getResultList();
        List<UserDefinedAreaDto> userDefinedAreaDtos = UserDefinedAreaDtoMapper.mapToDtos(userDefinedAreas);
        return userDefinedAreaDtos;
    }
//    public UserDefinedAreaDto findById(Principal principal, Integer id) {
//        var area = em.find(UserDefinedArea.class, id);
//
//    // FIXME check owner
//    }

    /**
     * Create a new UserDefinedArea
     */
    public UserDefinedAreaDto createUserDefinedArea(Principal principal,
													UserDefinedAreaDto userDefinedAreaDto)
            throws SymphonyStandardAppException {

        if (!validateNonArrayPolygon(userDefinedAreaDto.getPolygon())) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.POLYGON_ARRAY_FORBIDDEN);
        }

		UserDefinedArea userDefinedArea = UserDefinedAreaDtoMapper.mapToEntity(userDefinedAreaDto, principal.getName());
		if (userDefinedArea.getId() != null && !userDefinedArea.getId().equals(0) ){
			 throw new SymphonyStandardAppException(SymphonyModelErrorCode.USER_DEF_AREA_ID_ERROR);
		}

		userDefinedArea.setId(null);
		em.persist(userDefinedArea);
		return UserDefinedAreaDtoMapper.mapToDto(userDefinedArea);
	}

	/**
	 * Update a userDefinedArea
	 * 
	 * @param userDefinedAreaDto
	 * @return UserDefinedAreaDto
	 * @param principal userPrincipal
	 * @throws SymphonyStandardAppException 
	 */
	public UserDefinedAreaDto updateUserDefinedArea(Principal principal, UserDefinedAreaDto userDefinedAreaDto) throws SymphonyStandardAppException{

        if (!validateNonArrayPolygon(userDefinedAreaDto.getPolygon())) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.POLYGON_ARRAY_FORBIDDEN);
        }

        UserDefinedArea userDefinedArea = UserDefinedAreaDtoMapper.mapToEntity(userDefinedAreaDto,
				principal.getName());
        UserDefinedArea userDefinedAreaToUpdate = getUserDefinedAreaByById(userDefinedArea.getId());
        if (principal.getName() == null || (userDefinedAreaToUpdate != null && !principal.getName().equals(userDefinedAreaToUpdate.getOwner()))) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.USER_DEF_AREA_NOT_OWNED_BY_USER);
        }
        if (userDefinedArea == null || userDefinedAreaToUpdate == null) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.USER_DEF_AREA_NOT_FOUND);
        }
        return UserDefinedAreaDtoMapper.mapToDto(em.merge(userDefinedArea));
    }

    /**
     * @return The dto, or empty if inspection failed
     */
    public UploadedUserDefinedAreaDto inspectGeoPackage(File file) throws SymphonyStandardAppException {
        // https://docs.geotools.org/latest/userguide/library/data/geopackage.html
        try (GeoPackage pkg = new GeoPackage(file)) {
            var features = pkg.features();
            if (features.size() > 0) {

                SimpleFeatureReader sfReader;
                List<String> featureIdentifiers = new ArrayList<>();

                // Add only layers that have geometric (polygonal) features.
                for(FeatureEntry fe : features) {
                    sfReader = pkg.reader(fe, null, null);
                    if(sfReader.hasNext() && sfReader.next().getDefaultGeometry() != null) {
                        featureIdentifiers.add(fe.getIdentifier());
                    }
                }

                if(featureIdentifiers.size() > 0) {
                    var srid = features.get(0).getSrid();
                    return new UploadedUserDefinedAreaDto(featureIdentifiers, srid, file.getName());
                } else {
                    throw new SymphonyStandardAppException(SymphonyModelErrorCode.GEOPACKAGE_MISSING_GEOMETRY);
                }
            }
            else throw new SymphonyStandardAppException(SymphonyModelErrorCode.GEOPACKAGE_NO_FEATURES);
        } catch (IOException e) {
            if (e.getCause() instanceof SQLiteException)
                throw new SymphonyStandardAppException(SymphonyModelErrorCode.NOT_A_GEOPACKAGE);
            else
                throw new SymphonyStandardAppException(SymphonyModelErrorCode.GEOPACKAGE_OPEN_ERROR);
        }
    }



    /**
     * Import a user-supplied GeoPackage as a user-defined area
     */
    public AreaImportResponse importUserDefinedAreaFromPackage(Principal principal, GeoPackage pkg)
        throws SymphonyStandardAppException {

        try {
            var features = pkg.features();

            Geometry tmpGeometry;
            UserDefinedArea areaToImport;
            SimpleFeatureReader sfReader;
            List<String> persistedAreas = new ArrayList<>();

            for(FeatureEntry tmpEntry: features) {
                sfReader = pkg.reader(tmpEntry, null, null);

                tmpGeometry = null;
                Geometry addGeometry;

                while(sfReader.hasNext()) {
                    addGeometry = (Geometry) sfReader.next().getDefaultGeometry();

                    if (addGeometry != null) {
                        if (addGeometry.getSRID() != 4326) {
                            try {
                                var sourceCRS = CRS.decode("EPSG:" + addGeometry.getSRID(), true);
                                var transform = CRS.findMathTransform(sourceCRS, DefaultGeographicCRS.WGS84);
                                addGeometry = JTS.transform(addGeometry, transform);
                            } catch (FactoryException | TransformException e) {
                                throw new SymphonyStandardAppException(SymphonyModelErrorCode.GEOPACKAGE_REPROJECTION_FAILED);
                            }
                        }
                        tmpGeometry = (tmpGeometry == null) ? addGeometry : tmpGeometry.union(addGeometry);
                    }
                }

                if(tmpGeometry != null) {
                    persistedAreas.add(tmpEntry.getIdentifier());
                    areaToImport = new UserDefinedArea();
                    areaToImport.setPolygon(GeoJSONWriter.toGeoJSON(tmpGeometry));
                    areaToImport.setOwner(principal.getName());
                    areaToImport.setName(tmpEntry.getIdentifier());
                    areaToImport.setDescription(tmpEntry.getDescription());
                    em.persist(areaToImport);
                } else {
                    throw new SymphonyStandardAppException(SymphonyModelErrorCode.GEOPACKAGE_MISSING_GEOMETRY);
                }
            }
            return new AreaImportResponse() {{
                setAreaNames(
                    persistedAreas.toArray(new String[0])
                );
            }};

        } catch (IOException e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.GEOPACKAGE_READ_FEATURE_FAILURE);
        }
    }


    /**
     * Delete a UserDefinedArea wit the given id
     */
    public void delete(Principal principal, Integer id) throws SymphonyStandardAppException {
        UserDefinedArea userDefinedArea = getUserDefinedAreaByById(id);
        if (userDefinedArea == null) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.USER_DEF_AREA_NOT_FOUND);
        }
        if (principal.getName() == null || !principal.getName().equals(userDefinedArea.getOwner())) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.USER_DEF_AREA_NOT_OWNED_BY_USER);
        }
        em.remove(userDefinedArea);
    }


    /**
     * @return null if a UserDefinedArea with the given name not already exists else return the first
     * UserDefinedArea found (name should be unique per user)
     */
    private UserDefinedArea getUserDefinedAreaByName(Principal principal, String name) {
        var userDefinedAreas = em.createQuery(
            "Select u FROM UserDefinedArea u WHERE u.name = :name AND u.owner = :owner",
                UserDefinedArea.class)
                .setParameter("name", name)
                .setParameter("owner", principal.getName())
                .getResultList();
        if (userDefinedAreas.size() < 1) return null;
        return userDefinedAreas.get(0);
    }

    /**
     * Find the UserDefinedArea with the given id
     */
    private UserDefinedArea getUserDefinedAreaByById(Integer id) throws SymphonyStandardAppException {
        try {
            return em.find(UserDefinedArea.class, id);
        } catch (Exception e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.USER_DEF_AREA_BY_ID_ERROR);
        }
    }

    private boolean validateNonArrayPolygon(Object object) {
        if (object instanceof ArrayList) {
            LOG.error("Not a valid Userdefined polygon");
            return false;
        }
        return true;
    }

    public UserDto getUser(Principal user) throws IOException {
        UserSettings settings = em.find(UserSettings.class, user.getName());
        return new UserDto(
            user.getName(),
            settings == null ? Map.of() : mapper.readerFor(Map.class).readValue(settings.getSettings())
        );
    }

    public void updateUserSettings(Principal userPrincipal, Map<String, Object> settings) throws SymphonyStandardAppException {
        UserSettings userSettings = em.find(UserSettings.class, userPrincipal.getName());
        if (userSettings == null) {
            userSettings = new UserSettings();
            userSettings.setUser(userPrincipal.getName());
        }
        try {
            userSettings.updateSettings(settings);
        } catch (JsonMappingException e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.OTHER_ERROR, e);
        }

        em.persist(userSettings);
    }
}
