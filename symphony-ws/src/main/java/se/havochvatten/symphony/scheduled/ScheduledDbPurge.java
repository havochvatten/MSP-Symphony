package se.havochvatten.symphony.scheduled;

import se.havochvatten.symphony.service.CalcService;
import se.havochvatten.symphony.service.PropertiesService;

import jakarta.annotation.PostConstruct;
import jakarta.ejb.*;
import java.util.Date;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

@Startup
@Singleton
public class ScheduledDbPurge {
    private static final Logger logger = Logger.getLogger(ScheduledDbPurge.class.getName());

    @EJB
    CalcService calcService;

    @EJB
    PropertiesService props;

    @PostConstruct
    public void init() {
        logger.info("ScheduledDbPurge run at startup");
        purgeDatabase();
    }

    // runs every 24 hours (at 00:00)
    @Schedule(hour = "0", minute = "0", second = "0")
    public void purgeDatabase() {

        String maxDaysParam = props.getProperty("calc.dbpurge_calculation_max_age_days");

        if(maxDaysParam != null) {
            try {
                int maxDays = Integer.parseInt(maxDaysParam);
                Date earliest = new Date(System.currentTimeMillis() - TimeUnit.DAYS.toMillis(maxDays));
                int removed = calcService.removeCalculationTiffOlderThan(earliest);
                logger.log(Level.INFO, () -> String.format("Removed %d calculation blobs older than (%d) days", removed, maxDays));
            } catch (NumberFormatException e) {
                logger.warning("Daily calculation blobs purge attempt failed: " +
                                    "Invalid integer value found for calc.dbpurge_calculation_max_age_days");
            }
        } else {
            logger.info("No database purging interval set, skipping");
        }
    }
}
