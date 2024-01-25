package se.havochvatten.symphony.calculation;

import org.junit.Before;
import org.junit.Test;
import se.havochvatten.symphony.service.CalcService;

import java.util.Collections;
import java.util.List;

import static org.junit.Assert.assertEquals;

public class CalcServiceTest {

    CalcService service;

    @Before
    public void setup() {
        service = new CalcService();
    }

    @Test
    public void makeCalculationName() {
        assertEquals("NAME (1)",
                service.findSequentialUniqueName("NAME", Collections.emptyList(), 1));
        assertEquals("NAME (2)",
                service.findSequentialUniqueName("NAME", List.of("NAME", "NAME (1)"), 1));
        assertEquals("NAME (1)",
                service.findSequentialUniqueName("NAME", List.of("NAME", "FOO-BAR"), 1));
        assertEquals("NAME (2)",
                service.findSequentialUniqueName("NAME", List.of("NAME", "FOO-BAR"), 2));
    }
}
