package se.havochvatten.symphony.service;

import javax.ejb.ConcurrencyManagement;
import javax.ejb.ConcurrencyManagementType;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

@Singleton
@Startup
@ConcurrencyManagement(ConcurrencyManagementType.BEAN)
public class PropertiesService {
    private static final Logger LOG = Logger.getLogger(PropertiesService.class.getName());
    private static final String DEFAULTS_RESOURCE = "/symphony-global.properties";
    private static String GLOBAL_PROPERTIES = "/app/config/symphony/symphony-global.properties";

    private final java.util.Properties props = new Properties(); // java.util.Properties is thread-safe

    // Because we do not depend on any other injected services use constructor instead of
    // @PostConstruct. This also makes it possible to use the service in tests without resorting
    // to an EJB container.
    public PropertiesService() {
        Properties defaults = new Properties();

        String override = System.getProperty("se.symphony.global");

        if (override != null) {
            GLOBAL_PROPERTIES = override;
            LOG.config("Trying to use " + GLOBAL_PROPERTIES + " as property");
        }

        try {
            defaults.load(this.getClass().getResourceAsStream(DEFAULTS_RESOURCE));
        } catch (IOException ex) {
            LOG.log(Level.SEVERE, "Could not read default Symphony properties", ex);
        }

        props.putAll(defaults);
        LOG.config("Properties defaults: " + defaults.size());
        try (FileInputStream inputStream = new FileInputStream(GLOBAL_PROPERTIES)) {
            // Merge user properties with default properties
            LOG.config("Loading overrides");
            props.load(inputStream);
        } catch (IOException ex) {
            LOG.config("No user properties, using defaults only");
        }
        LOG.config("Properties with overrides: " + props.size());

    }

    public String getProperty(String name) {
        return props.getProperty(name);
    }

    public int getPropertyAsInt(String name) {
        return Integer.parseInt(getProperty(name));
    }

    public int getPropertyAsInt(String name, int fallback) {
        return props.containsKey(name) ? getPropertyAsInt(name) : fallback;
    }

    public double getPropertyAsDouble(String name) {
        return Double.parseDouble(getProperty(name));
    }

    public double getPropertyAsDouble(String name, double fallback) {
        return props.containsKey(name) ? getPropertyAsDouble(name) : fallback;
    }


    // TODO Add API using Optional instead?
    public String getProperty(String name, String fallback) {
        return props.containsKey(name) ? props.getProperty(name) : fallback;
    }
}
