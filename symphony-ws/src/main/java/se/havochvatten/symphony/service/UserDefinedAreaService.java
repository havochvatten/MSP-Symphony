package se.havochvatten.symphony.service;

import org.geotools.data.geojson.GeoJSONWriter;
import org.geotools.geometry.jts.JTS;
import org.geotools.geopkg.FeatureEntry;
import org.geotools.geopkg.GeoPackage;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.locationtech.jts.geom.Geometry;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.sqlite.SQLiteException;
import se.havochvatten.symphony.dto.UploadedUserDefinedAreaDto;
import se.havochvatten.symphony.dto.UserDefinedAreaDto;
import se.havochvatten.symphony.entity.UserDefinedArea;
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
import java.util.stream.Collectors;

@Stateless
public class UserDefinedAreaService {
    private static final Logger LOG = LoggerFactory.getLogger(UserDefinedAreaService.class);

    @PersistenceContext(unitName = "symphonyPU")
    private EntityManager em;

    /**
     * Find all user defined areas
     */
    public List<UserDefinedAreaDto> findAllByOwner(Principal principal) throws SymphonyStandardAppException {
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
		if  (getUserDefinedAreaByName(principal, userDefinedArea.getName()) != null){
			throw new SymphonyStandardAppException(SymphonyModelErrorCode.USER_DEF_AREA_NAME_EXISTS);
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
        UserDefinedArea existingUserDefinedAreaByName = getUserDefinedAreaByName(principal, userDefinedArea.getName());
        if (existingUserDefinedAreaByName != null && !existingUserDefinedAreaByName.getId().equals(userDefinedArea.getId())) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.USER_DEF_AREA_NAME_EXISTS_ON_OTHER);
        }
        return UserDefinedAreaDtoMapper.mapToDto(em.merge(userDefinedArea));
    }

    /**
     * @return The dto, or empty if inspection failed
     */
    public UploadedUserDefinedAreaDto inspectGeoPackage(Principal principal, File file) throws SymphonyStandardAppException {
        // https://docs.geotools.org/latest/userguide/library/data/geopackage.html
        try (GeoPackage pkg = new GeoPackage(file)) {
            var features = pkg.features();
            if (features.size() > 0) {
                var featureIdentifiers = pkg.features()
                    .stream()
                    .map(f -> f.getIdentifier())
                    .collect(Collectors.toList());

                // TODO Do away with this constraint
                var featureToBeImportedName = featureIdentifiers.get(0);
                if (getUserDefinedAreaByName(principal, featureToBeImportedName) != null)
                    throw new SymphonyStandardAppException(SymphonyModelErrorCode.USER_DEF_AREA_NAME_EXISTS);

                var srid = features.get(0).getSrid();
                return new UploadedUserDefinedAreaDto(featureIdentifiers, srid, file.getName());
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
    public UserDefinedAreaDto importUserDefinedAreaFromPackage(Principal principal, GeoPackage pkg,
                                                               String areaName)
        throws SymphonyStandardAppException {

        FeatureEntry featureToImport = null;
        SimpleFeature theFeature = null;
        try {
            var features = pkg.features();
            featureToImport = features.get(0); // TODO support multiple features
            var reader = pkg.reader(featureToImport, null, null);
            assert (reader.hasNext());
            theFeature = reader.next();
        } catch (IOException e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.GEOPACKAGE_READ_FEATURE_FAILURE);
        }

        // TODO Do away with this constraint
        if (getUserDefinedAreaByName(principal, featureToImport.getIdentifier()) != null)
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.USER_DEF_AREA_NAME_EXISTS);

        var geometry = (Geometry)theFeature.getDefaultGeometry();
        if (geometry != null) {
            if (geometry.getSRID() != 4326) {
                try {
                    var sourceCRS = CRS.decode("EPSG:"+geometry.getSRID(), true);
                    var transform = CRS.findMathTransform(sourceCRS, DefaultGeographicCRS.WGS84);
                        geometry = JTS.transform(geometry, transform);
                } catch (FactoryException|TransformException e) {
                    throw new SymphonyStandardAppException(SymphonyModelErrorCode.GEOPACKAGE_REPROJECTION_FAILED);
                }
            }

            UserDefinedArea areaToImport = new UserDefinedArea();
            areaToImport.setPolygon(GeoJSONWriter.toGeoJSON(geometry));
            areaToImport.setOwner(principal.getName());
            areaToImport.setName(areaName != null ? areaName : featureToImport.getIdentifier());
            areaToImport.setDescription(featureToImport.getDescription());
            em.persist(areaToImport);
            return UserDefinedAreaDtoMapper.mapToDto(areaToImport);
        } else
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.GEOPACKAGE_MISSING_GEOMETRY);
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
}
