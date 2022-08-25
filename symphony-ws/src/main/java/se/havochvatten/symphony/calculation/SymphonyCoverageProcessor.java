package se.havochvatten.symphony.calculation;

import org.geotools.coverage.processing.CoverageProcessor;
import org.geotools.coverage.processing.OperationJAI;
import se.havochvatten.symphony.calculation.jai.CIA.CumulativeImpactDescriptor;
import se.havochvatten.symphony.calculation.jai.CIA.RarityAdjustedCumulativeImpactDescriptor;
import se.havochvatten.symphony.calculation.jai.rescale2.Rescale2Descriptor;

import javax.ejb.Singleton;

@Singleton
public class SymphonyCoverageProcessor extends CoverageProcessor {
    public SymphonyCoverageProcessor() {
        super();
        addOperation(new OperationJAI(new Rescale2Descriptor()));
        addOperation(new OperationJAI(new CumulativeImpactDescriptor()));
        addOperation(new OperationJAI(new RarityAdjustedCumulativeImpactDescriptor()));
        addOperation(new OperationJAI("Subtract"));
        addOperation(new OperationJAI("Divide"));
        addOperation(new OperationJAI("Stats"));
    }
}
