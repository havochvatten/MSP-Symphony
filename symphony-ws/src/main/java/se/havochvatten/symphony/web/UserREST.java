package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.apache.commons.io.IOUtils;
import org.geotools.geopkg.GeoPackage;
import org.jboss.resteasy.plugins.providers.multipart.InputPart;
import org.jboss.resteasy.plugins.providers.multipart.MultipartFormDataInput;
import se.havochvatten.symphony.dto.AreaImportResponse;
import se.havochvatten.symphony.dto.UploadedUserDefinedAreaDto;
import se.havochvatten.symphony.dto.UserDefinedAreaDto;
import se.havochvatten.symphony.exception.SymphonyModelErrorCode;
import se.havochvatten.symphony.exception.SymphonyStandardAppException;
import se.havochvatten.symphony.service.UserService;

import javax.annotation.security.RolesAllowed;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.*;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@Stateless
@Api(value = "/userdefinedarea",
        produces = MediaType.APPLICATION_JSON,
        consumes = MediaType.APPLICATION_JSON)
@Path("user")
public class UserREST {
    private static final Logger LOG = Logger.getLogger(LegendREST.class.getName());
    private static final java.nio.file.Path TEMP_DIR = Paths.get(System.getProperty("java.io.tmpdir"));

    @EJB
    UserService userService;

    @GET
    @Path("/area/all")
    @ApiOperation(value = "List all user defined areas belonging to logged in user",
            response = UserDefinedAreaDto.class, responseContainer = "List")
    @Produces({MediaType.APPLICATION_JSON}) // GeoJSON polygons
    @RolesAllowed("GRP_SYMPHONY")
    public Response findAllByOwner(@Context HttpServletRequest req) throws SymphonyStandardAppException {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");

        List<UserDefinedAreaDto> userDefinedAreas =
                userService.findAllUserDefinedAreasByOwner(req.getUserPrincipal());
        return Response.ok(userDefinedAreas).build();
    }

//    @GET
//    @Path("{id}")
//    @ApiOperation(value = "Get a specified  user defined area belonging to the logged in user")
//    @Produces({MediaType.APPLICATION_JSON})
//    @RolesAllowed("GRP_SYMPHONY")
//    public UserDefinedAreaDto getUserDefinedArea(@Context HttpServletRequest req,
//                                                 @PathParam("id") Integer id)
//        throws SymphonyStandardAppException {
//        if (req.getUserPrincipal() == null)
//            throw new NotAuthorizedException("Null principal");
//
//        var area  = userDefinedAreaService.findById(id);
//        return Response.ok(userDefinedAreas).build();
//    }

    @POST
    @Path("/area")
    @ApiOperation(value = "Create new user defined area - GeoJSON polygons", response =
            UserDefinedAreaDto.class)
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response createUserDefinedArea(@Context HttpServletRequest req, @Context UriInfo uriInfo,
                                          UserDefinedAreaDto userDefinedAreaDto) throws SymphonyStandardAppException {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");

        userDefinedAreaDto = userService.createUserDefinedArea(req.getUserPrincipal(),
                userDefinedAreaDto);
        URI uri = uriInfo.getAbsolutePathBuilder().path(String.valueOf(userDefinedAreaDto.getId())).build();
        return Response.created(uri).entity(userDefinedAreaDto).build();
    }

    @POST
    @Path("/area/import")
    @ApiOperation(value = "Submit a GeoPackage for inspection with intent to have it imported",
        response = UploadedUserDefinedAreaDto.class)
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response uploadAndInspectUserDefinedArea(@Context HttpServletRequest req,
                                                    MultipartFormDataInput input)
        throws SymphonyStandardAppException, IOException {

        var map = input.getFormDataMap();
        if (!map.containsKey("package"))
            throw new BadRequestException();

        var parts = map.get("package");
        InputPart part = parts.get(0);
        LOG.info(() -> "Received file: "+getFilenameFromHeader(part.getHeaders()));
        // TODO: verify content-type?

        // Write received file to a tempfile since GeoPackage constructor can only take file objects
        java.nio.file.Path packagePath = null;
        File packageFile;
        try {
            InputStream inputStream = part.getBody(InputStream.class, null);
            byte[] bytes = IOUtils.toByteArray(inputStream);
            packagePath = Files.createTempFile(TEMP_DIR, null, null);
            packageFile = packagePath.toFile();
            WebUtil.writeFile(bytes, packageFile);
        } catch (IOException e) {
            if (packagePath != null)
                Files.deleteIfExists(packagePath);
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.GEOPACKAGE_OPEN_ERROR);
        }

        try {
            var dto = userService.inspectGeoPackage(packageFile);
            req.getSession().setAttribute(dto.key, packagePath.toFile());
            return Response.ok(dto).build();
        } catch (SymphonyStandardAppException|java.lang.reflect.UndeclaredThrowableException e) {
            Files.delete(packagePath);
            throw e;
        }
    }

    @PUT
    @Path("/area/import/{key}")
    @ApiOperation(value = "Confirm import of previously uploaded GeoPackage",
        response = UserDefinedAreaDto.class)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response actuallyImportUserDefinedArea(@Context HttpServletRequest req,
                                                  @Context UriInfo uriInfo,
                                                  @PathParam("key") String key)
        throws SymphonyStandardAppException {
        var pkgFile = (java.io.File) req.getSession(false).getAttribute(key);

        AreaImportResponse response;
        try (var pkg = new GeoPackage(pkgFile)) {
            LOG.info("Importing uploaded GeoPackage "+pkgFile+" for user "+req.getUserPrincipal().getName());
            response = userService.importUserDefinedAreaFromPackage(req.getUserPrincipal(), pkg);
        } catch (IOException e) {
            throw new SymphonyStandardAppException(SymphonyModelErrorCode.GEOPACKAGE_READ_FEATURE_FAILURE);
        }

        req.getSession().removeAttribute(key);
//        Files.deleteIfExists(pkgPath); // fails since file is still used by other process?? how to close?
        return Response.status(201).entity(response).build();
    }

    /**
     * header sample
     * {
     * 	Content-Type=[image/png],
     * 	Content-Disposition=[form-data; name="file"; filename="filename.extension"]
     * }
     *
     * Copied from https://mkyong.com/webservices/jax-rs/file-upload-example-in-resteasy/
     **/
    private String getFilenameFromHeader(MultivaluedMap<String, String> header) {
        String[] contentDisposition = header.getFirst("Content-Disposition").split(";");
        for (String filename : contentDisposition) {
            if ((filename.trim().startsWith("filename"))) {
                String[] name = filename.split("=");
                String finalFileName = name[1].trim().replaceAll("\"", "");
                return finalFileName;
            }
        }
        return null;
    }

    @PUT
    @Path("/area/{id}")
    @ApiOperation(value = "Update user defined area - GeoJSON polygons", response = UserDefinedAreaDto.class)
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response updateUserDefinedArea(@Context HttpServletRequest req, @PathParam("id") Integer id,
                                          UserDefinedAreaDto userDefinedAreaDto) throws SymphonyStandardAppException {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");

        userDefinedAreaDto = userService.updateUserDefinedArea(req.getUserPrincipal(),
                userDefinedAreaDto);
        return Response.ok(userDefinedAreaDto).build();
    }

    @DELETE
    @ApiOperation(value = "Delete user defined area", response = Response.class)
    @Path("/area/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response deleteUserDefinedArea(@Context HttpServletRequest req, @PathParam("id") Integer id) throws SymphonyStandardAppException {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");

        userService.delete(req.getUserPrincipal(), id);
        return Response.ok().build();
    }

    @PUT
    @Path("/settings")
    @ApiOperation(value = "Update user settings")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("GRP_SYMPHONY")
    public Response updateUserSettings(@Context HttpServletRequest req, Map<String, Object> settings) {
        if (req.getUserPrincipal() == null)
            throw new NotAuthorizedException("Null principal");

        try {
            userService.updateUserSettings(req.getUserPrincipal(), settings);
            return Response.ok().build();
        } catch (SymphonyStandardAppException e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e).build();
        }
    }

}
