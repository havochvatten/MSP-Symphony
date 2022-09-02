package se.havochvatten.symphony.appconfig;

import io.swagger.jaxrs.config.BeanConfig;
import it.geosolutions.jaiext.JAIExt;

import javax.ws.rs.core.Application;

@javax.ws.rs.ApplicationPath("service")
public class SymphonyApplication extends Application {
    static {
        // According to JAI-Ext docs it is recommended to init from an application static initializer
        JAIExt.initJAIEXT();
    }

    public SymphonyApplication() {
        BeanConfig beanConfig = new BeanConfig();
        beanConfig.setVersion("1.0.2");
        //beanConfig.setSchemes(new String[]{"http","https"});
        beanConfig.setTitle("Symphony REST API");
        beanConfig.setBasePath("/symphony-ws/service");
        beanConfig.setResourcePackage("se.havochvatten.symphony.web," +
                "se.havochvatten.symphony.calculation," +
                "se.havochvatten.symphony.scenario");
//        beanConfig.setScan(false);
    }
}
