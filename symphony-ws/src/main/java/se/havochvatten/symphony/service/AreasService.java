package se.havochvatten.symphony.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.geotools.data.*;
import org.geotools.data.geojson.GeoJSONReader;
import org.geotools.data.shapefile.ShapefileDataStoreFactory;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.data.simple.SimpleFeatureStore;
import org.geotools.feature.DefaultFeatureCollection;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.geotools.feature.simple.SimpleFeatureTypeBuilder;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.MultiPolygon;
import org.locationtech.jts.geom.Polygon;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.referencing.FactoryException;
import se.havochvatten.symphony.entity.NationalArea;
import se.havochvatten.symphony.entity.UserDefinedArea;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.web.WebUtil;

import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Stateless
public class AreasService {
    @PersistenceContext(unitName = "symphonyPU")
    EntityManager em;

    private static final ObjectMapper mapper = new ObjectMapper();

    private static final String[] shpComponents = new String[]{"shp", "dbf", "shx", "prj"};

    public record FileStruct(String fileName, byte[] content) {}

    private static SimpleFeatureType polygonType(JsonNode polygonJson) throws IllegalArgumentException {
        JsonNode typeField = polygonJson.get("type");

        if(typeField == null)
            throw new IllegalArgumentException("Missing 'type' field in polygon JSON");

        return typeField.asText().equals("MultiPolygon") ? _multiPolygonType : _polygonType;
    }

    private final static SimpleFeatureType _polygonType;
    private final static SimpleFeatureType _multiPolygonType;

    static {
        SimpleFeatureTypeBuilder builder = new SimpleFeatureTypeBuilder();

        builder.setName("Polygon");
        builder.setCRS(DefaultGeographicCRS.WGS84);
        builder.add("the_geom", Polygon.class);
        builder.add("name", String.class);
        _polygonType = builder.buildFeatureType();

        builder = new SimpleFeatureTypeBuilder();
        builder.setName("MultiPolygon");
        builder.setCRS(DefaultGeographicCRS.WGS84);
        builder.add("the_geom", MultiPolygon.class);
        builder.add("name", String.class);
        _multiPolygonType = builder.buildFeatureType();
    }

    /**
     * @return JSON structure with the areas belonging to the country with the given iso3 country code and
     * type
     */
    public NationalArea getNationalAreaByCountryAndType(String countryCodeIso3, String type)
            throws SymphonyStandardAppException {
        NationalArea nationalArea = null;
        try {
            nationalArea = em.createNamedQuery("NationalArea.findByCountryIso3AndType", NationalArea.class)
                    .setParameter("countryIso3", countryCodeIso3)
                    .setParameter("type", type)
                    .getSingleResult();
        } catch (NoResultException e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.NATIONAL_AREA_NOT_FOUND);
        }
        return nationalArea;
    }

    private static JsonNode getNodeByKeyValue(JsonNode node, String key, String value) throws SymphonyStandardAppException {
        for (JsonNode n : node) {
            if (n.has(key) && n.get(key).asText().equals(value)) {
                return n;
            }
        }
        throw new SymphonyStandardAppException(SymphonyModelErrorCode.NATIONAL_AREA_NOT_FOUND);
    }

    private FeatureCollection<SimpleFeatureType, SimpleFeature> featuresFromStatePath(String[] statePath, String countryCode)
        throws SymphonyStandardAppException, FactoryException {

        if (statePath.length < 2) { // assert minimum path length
            return null;
        }

        if (statePath[0].equals("userArea")) {
            UserDefinedArea userArea = em.find(UserDefinedArea.class, Integer.parseInt(statePath[1]));

            if (userArea != null) {
                try {
                    JsonNode areaPolygonJson = mapper.readTree(userArea.getPolygon());
                    SimpleFeatureType featureType = polygonType(areaPolygonJson);
                    DefaultFeatureCollection featureCollection = new DefaultFeatureCollection("internal", featureType);

                    Geometry geometry = GeoJSONReader.parseGeometry(userArea.getPolygon());
                    SimpleFeature feature = SimpleFeatureBuilder.build(featureType, new Object[]{geometry, userArea.getName()}, null);
                    featureCollection.add(feature);

                    return featureCollection;
                } catch (IllegalArgumentException | JsonProcessingException jx) {
                    throw new SymphonyStandardAppException(SymphonyModelErrorCode.USER_DEF_AREA_POLYGON_MAPPING_ERROR, jx);
                }
            } else {
                throw new SymphonyStandardAppException(SymphonyModelErrorCode.USER_DEF_AREA_NOT_FOUND);
            }
        } else {
            if(statePath.length < 6) { // assert national area path length
                throw new SymphonyStandardAppException(SymphonyModelErrorCode.NATIONAL_AREA_NOT_FOUND);
            }
            try {
                NationalArea nationalArea = getNationalAreaByCountryAndType(countryCode, statePath[1]);
                JsonNode areasJson = mapper.readTree(nationalArea.getAreasJson()),
                    cPath = getNodeByKeyValue(areasJson.get(statePath[2]), "en", statePath[3]),
                    area  = getNodeByKeyValue(cPath.get(statePath[4]), "name", statePath[5]);

                SimpleFeatureType featureType = polygonType(area.get("polygon"));
                DefaultFeatureCollection featureCollection = new DefaultFeatureCollection("internal", featureType);

                Geometry geometry = GeoJSONReader.parseGeometry(area.get("polygon").toString());
                SimpleFeature feature = SimpleFeatureBuilder.build(featureType, new Object[]{geometry, area.get("name").asText()}, null);
                featureCollection.add(feature);

                return featureCollection;
            } catch (IllegalArgumentException | JsonProcessingException jx) {
                throw new SymphonyStandardAppException(SymphonyModelErrorCode.SHAPEFILE_GENERATION_ERROR, jx);
            }
        }
    }

    public Optional<FileStruct> getAreaAsShapeFile(String[] statePath, String countryCode)
        throws SymphonyStandardAppException {
        FeatureCollection<SimpleFeatureType, SimpleFeature> featureCollection;

        try {
            featureCollection = featuresFromStatePath(statePath, countryCode);
        } catch (FactoryException fx) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.SHAPEFILE_GENERATION_ERROR, fx);
        }

        if(featureCollection == null || featureCollection.isEmpty()) {
            return Optional.empty();
        }

        try {
            Path shapeFilePath = Files.createTempFile("shp_download", ".shp");
            String targetFileName =
                WebUtil.escapeFilename(featureCollection.features().next().getAttribute("name").toString());
            Map<String, Object> params = new HashMap<>();

            params.put("url", shapeFilePath.toUri().toURL());
            params.put("create spatial index", Boolean.TRUE);

            try (Transaction transaction = new DefaultTransaction("create")) {
                DataStoreFactorySpi factory = new ShapefileDataStoreFactory();
                DataStore dataStore = factory.createNewDataStore(params);

                try {
                    dataStore.createSchema(featureCollection.getSchema());
                    SimpleFeatureSource featureSource = dataStore.getFeatureSource(dataStore.getTypeNames()[0]);

                    if (featureSource instanceof SimpleFeatureStore featureStore) {
                        featureStore.setTransaction(transaction);
                        featureStore.addFeatures(featureCollection);
                        transaction.commit();
                    }

                } catch (IOException e) {
                    transaction.rollback();
                    throw e;
                } finally {
                    dataStore.dispose();
                }

            } catch (Exception e) {
                throw new IOException(e);
            }

            byte[] zipFile = Files.readAllBytes(
                Paths.get(archiveShapeForDownload(shapeFilePath, targetFileName)));
            Files.deleteIfExists(shapeFilePath);

            return Optional.of(new FileStruct(targetFileName + ".zip", zipFile));

        } catch (IOException e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.SHAPEFILE_GENERATION_ERROR, e);
        }
    }

    private String archiveShapeForDownload(Path shapeFilePath, String targetFileName) throws IOException {
        byte[] buffer = new byte[1024];

        Path zipFile = Files.createTempFile(targetFileName, ".zip");

        FileOutputStream fos = new FileOutputStream(zipFile.toFile());
        ZipOutputStream zos = new ZipOutputStream(fos);

        for (String extension : shpComponents) {

            Path filePath = shapeFilePath.resolveSibling(
                shapeFilePath.getFileName().toString().replace(".shp", "." + extension));

            if (Files.exists(filePath)) {
                ZipEntry zipEntry = new ZipEntry(targetFileName + "." + extension);
                zos.putNextEntry(zipEntry);

                try (FileInputStream inputStream = new FileInputStream(filePath.toFile())) {
                    int length;
                    while ((length = inputStream.read(buffer)) > 0) {
                        zos.write(buffer, 0, length);
                    }
                }
                zos.closeEntry();

                Files.deleteIfExists(filePath);
            }
        }

        zos.finish();
        zos.flush();

        return zipFile.toString();
    }
}
