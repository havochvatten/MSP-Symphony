package se.havochvatten.symphony.web;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import se.havochvatten.symphony.entity.*;
import se.havochvatten.symphony.entity.Scenario;
import se.havochvatten.symphony.service.PropertiesService;

import javax.annotation.security.RolesAllowed;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.ws.rs.DELETE;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Response;
import java.util.List;


@Stateless
@Path("testutilapi")
@RolesAllowed("GRP_SYMPHONY_ADMIN")
@Api(value = "/testutilapi")
public class RESTTestUtilApi {
    @EJB
    PropertiesService props;
    @PersistenceContext(unitName = "symphonyPU")
    private EntityManager em;

    @DELETE
    @Path("/userdefinedarea/{name}")
    public Response deleteUserDefinedArea(@PathParam("name") String name) {
        List<UserDefinedArea> userDefinedAreas = em.createQuery(
                "Select u From UserDefinedArea u Where u.name = :name", UserDefinedArea.class)
                .setParameter("name", name).getResultList();
        for (UserDefinedArea uda : userDefinedAreas) {
            em.remove(uda);
        }
        return Response.ok().build();
    }

    @DELETE
    @Path("/calculationareasensmatrix/{comment}")
    public Response deleteCalcAreaSensMatrix(@PathParam("comment") String comment) {
        List<CalcAreaSensMatrix> calcAreaSensMatrices = em.createQuery(
                "Select c From CalcAreaSensMatrix c Where c.comment like :comment", CalcAreaSensMatrix.class)
                .setParameter("comment", comment + "%")
                .getResultList();
        for (CalcAreaSensMatrix casm : calcAreaSensMatrices) {
            em.remove(casm);
        }
        return Response.ok().build();
    }

    @DELETE
    @Path("/areatype/{name}")
    public Response deleteAreaType(@PathParam("name") String name) {
        try {
            List<AreaType> areaTypes = em.createQuery("Select a From AreaType a Where a.atypeName like " +
                    ":name", AreaType.class).setParameter("name", name + "%").getResultList();
            for (AreaType aType : areaTypes) {
                em.remove(aType);
            }
        } catch (Exception ex) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        return Response.ok().build();
    }

    @DELETE
    @Path("/calculation/{id}")
    public Response deleteCalculation(@PathParam("id") int id) {
        try {
            var c = em.find(CalculationResult.class, id);
            em.remove(c);
        } catch (Exception ex) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        return Response.ok().build();
    }

    // Delete scenario and it's associated latestCalulation
    @DELETE
    @Path("/scenario/{id}")
    public Response deleteScenarioAndReferencedCalculation(@PathParam("id") int id) {
        try {
            var s = em.find(Scenario.class, id);
            //var c = s.getScenarioAreas().get(0).getLatestCalculation();
            //em.remove(c);
            em.remove(s);
        } catch (Exception ex) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        return Response.ok().build();
    }


    @DELETE
    @Path("/calculation/all")
    @ApiOperation(value = "Delete all calculations except baseline calculations")
    public Response deleteCalculations() {
        try {
            em.createNamedQuery("CalculationResult.findAllExceptBaseline", CalculationResult.class).getResultList().stream().forEach(em::remove);
        } catch (Exception ex) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        return Response.ok().build();
    }

    @DELETE
    @Path("/sensitivitymatrix/sensmatrixandcalcareasensmatrix/{name}")
    @ApiOperation(value = "Delete SensitivityMatrices and CalcAreaSensMatrices with requested name")
    public Response deleteSensMatrixAndCalcareaSensMatrix(@PathParam("name") String name) {
        try {
            // Delete CalcAreaSensMatrices
            List<CalcAreaSensMatrix> calcAreaSensMatrices = em.createQuery("Select c From " +
                    "CalcAreaSensMatrix c Where c.comment like :name", CalcAreaSensMatrix.class).setParameter("name", name + "%").getResultList();
            for (CalcAreaSensMatrix calcAreaSensMatrix : calcAreaSensMatrices) {
                em.remove(calcAreaSensMatrix);
            }
            // Delete SensitivityMatrices
            List<SensitivityMatrix> sensitivityMatrices = em.createQuery("Select s From SensitivityMatrix s" +
                    " Where s.name = :name", SensitivityMatrix.class).setParameter("name", name).getResultList();
            for (SensitivityMatrix sensitivityMatrix : sensitivityMatrices) {
                em.remove(sensitivityMatrix);
            }
        } catch (Exception ex) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        return Response.ok().build();
    }
}
