package se.havochvatten.symphony.appconfig;

import it.geosolutions.jaiext.JAIExt;

import javax.ws.rs.core.Application;

@javax.ws.rs.ApplicationPath("service")
public class SymphonyApplication extends Application {
    static {
        // According to JAI-Ext docs it is recommended to init from an application static initializer
        JAIExt.initJAIEXT();
    }

    public SymphonyApplication() {
        // Swagger configuration.
        // Swagger UI generation was disabled by commit b1cc428.

        // Configuration snippet below is retained, along with the package dependency,
        // pending a possible reintegration.

        //BeanConfig beanConfig = new BeanConfig();
        //beanConfig.setVersion("1.0.2");
        //beanConfig.setSchemes(new String[]{"http","https"});
        //beanConfig.setTitle("Symphony REST API");
        //beanConfig.setBasePath("/symphony-ws/service");
        //beanConfig.setResourcePackage("se.havochvatten.symphony.web");
        //beanConfig.setScan(true);
    }
}
