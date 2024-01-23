package se.havochvatten.symphony.calculation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.havochvatten.symphony.dto.SensitivityMatrix;
import se.havochvatten.symphony.entity.CalculationResult;
import se.havochvatten.symphony.service.CalcService;

import javax.servlet.http.HttpSession;
import java.awt.*;
import java.awt.image.IndexColorModel;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.DoublePredicate;
import java.util.stream.IntStream;

public class CalcUtil {
    private static final Logger LOG = LoggerFactory.getLogger(CalcUtil.class);

    static String LAST_CALCULATION_PROPERTY_NAME = "last-calculation";
    public static DoublePredicate isNoData = Double::isNaN;

    public static IndexColorModel makeIndexedColorModel(Color[] cs) {
        byte[] rs = new byte[cs.length], gs = new byte[cs.length], bs = new byte[cs.length];
        for (int i = 0; i < cs.length; i++) {
            rs[i] = (byte) (cs[i].getRed() & 0xff);
            gs[i] = (byte) (cs[i].getGreen() & 0xff);
            bs[i] = (byte) (cs[i].getBlue() & 0xff);
        }
        return new IndexColorModel(4, cs.length, rs, gs, bs, 0);
    }

    public static Map<Integer, Integer> createMapFromMatrixIdToIndex(List<SensitivityMatrix> matrices) {
        Map<Integer, Integer> matrixIdToIndex = new HashMap<>();
        IntStream.range(1, matrices.size()) // start at 1 to skip non-used empty matrix
                .forEach(index -> matrixIdToIndex.put(matrices.get(index).getMatrixId(), index));
        // TODO use toMap
        return matrixIdToIndex;
    }

    public static Optional<CalculationResult> getCalculationResultFromSessionOrDb(int id,
                                                                                  HttpSession session,
                                                                                  CalcService calcService) {
        return Optional.ofNullable(calcService.getCalculation(id));

//      previous approach for caching calculation results in session, apparently not reliable
//        var lastResult = (CalculationResult) session.getAttribute(LAST_CALCULATION_PROPERTY_NAME);
//
//        if (lastResult != null && lastResult.getId().equals(id)) {
//            LOG.info("Getting calculation {} from session {}", id, session.getId());
//            return Optional.of(lastResult);
//        } else
//            return Optional.ofNullable(calcService.getCalculation(id));
    }
}
