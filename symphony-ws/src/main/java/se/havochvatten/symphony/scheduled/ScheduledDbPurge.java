package se.havochvatten.symphony.scheduled;

import se.havochvatten.symphony.service.CalcService;
import se.havochvatten.symphony.service.PropertiesService;
import se.havochvatten.symphony.service.ReportService;

import javax.annotation.PostConstruct;
import javax.ejb.*;
import java.util.Date;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

@Startup
@Singleton
public class ScheduledDbPurge {
    private static final Logger logger = Logger.getLogger(ReportService.class.getName());

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
                logger.info("Removed " + removed + " calculation blobs older than (" + maxDays + ") days");
            } catch (NumberFormatException e) {
                logger.warning("Daily calculation blobs purge attempt failed: " +
                                    "Invalid integer value found for calc.dbpurge_calculation_max_age_days");
            }
        } else {
            logger.info("No database purging interval set, skipping");
        }
    }
}
