package se.havochvatten.symphony.util;

import com.github.miachm.sods.Borders;
import com.github.miachm.sods.Style;

public class ODSStyles {
    public static final Style
        totalHeaderLeft = new Style(), totalHeaderRight = new Style(),
        totalSubHeader = new Style(), singleSubHeader = new Style(), singleSumSubHeader = new Style(),
        cmpName = new Style(), calcName = new Style(),
        ecoHeader = new Style(), pressureHeaderLeft  = new Style(), pressureHeaderRight  = new Style(),
        onlyBold = new Style(), valueStyle = new Style(), thickRightBorder = new Style(), resultSep = new Style(),
        totalE = new Style(), totalE2 = new Style(), totalP = new Style(), totalP2 = new Style(),
        totalHE = new Style(), totalHP = new Style(), totalC = new Style(), totalC2 = new Style();

    static {
        cmpName.setFontSize(14);
        cmpName.setVerticalTextAligment(Style.VERTICAL_TEXT_ALIGMENT.Middle);

        calcName.setUnderline(true);
        calcName.setFontSize(11);

        for (Style s : new Style[]
            { ecoHeader, pressureHeaderLeft, pressureHeaderRight, valueStyle,
                totalHeaderLeft, totalHeaderRight, totalSubHeader,
                totalE, totalP, totalHE, totalHP, totalC, totalC2, onlyBold }) {
            s.setFontSize(10);
        }

        for(Style s: new Style[]
            { onlyBold, totalSubHeader, totalHE, totalHP, totalC, totalC2, calcName }) {
            s.setBold(true);
        }

        for (Style s : new Style[]
            { totalHE, totalHP, totalC, totalE, totalE2, totalP, totalP2 }) {
            s.setItalic(true);
        }

        ecoHeader.setTextAligment(Style.TEXT_ALIGMENT.Right);
        ecoHeader.setBorders(
            new Borders(false, null,
                true, "thin solid #000000",
                false, null,
                true, "2pt solid #000000"));

        pressureHeaderLeft.setBorders(
            new Borders(
                false, null,
                true, "2pt solid #000000",
                true, "thin solid #000000",
                false, null));

        pressureHeaderRight.setBorders(
            new Borders(
                false, null,
                true, "2pt solid #000000",
                false, null,
                true, "thin solid #000000"));

        valueStyle.setBorders(
            new Borders(
                false, null,
                true, "thin solid #000000",
                false, null,
                true, "thin solid #000000"));

        totalSubHeader.setBorders(
            new Borders(
                true, "thin double #000000",
                false, null,
                false, null,
                true, "thin solid #000000"));

        singleSubHeader.setBorders(
            new Borders(
                true, "thick solid #000000",
                true, "thin dashed #000000",
                false, null,
                true, "thin solid #000000"));

        singleSumSubHeader.setBorders(
            new Borders(
                true, "thick solid #000000",
                true, "thin dashed #000000",
                true, "thick double #000000",
                true, "thin solid #000000"));

        totalE.setBorders(
            new Borders(
                false, null,
                true, "thin solid #000000",
                true, "thin double #000000",
                true, "thin solid #000000"));

        totalE2.setBorders(
            new Borders(
                false, null,
                true, "thin solid #000000",
                true, "thin solid #000000",
                false, null));

        totalP.setBorders(
            new Borders(
                true, "thick solid #000000",
                false, null,
                false, null,
                true, "thin solid #000000"));

        totalP2.setBorders(
            new Borders(
                true, "thin solid #000000",
                false, null,
                false, null,
                true, "thin solid #000000"));

        totalHE.setBorders(
            new Borders(
                false, null,
                true, "thin solid #000000",
                true, "thin double #000000",
                false, null));

        totalHP.setBorders(
            new Borders(
                false, null,
                true, "thin solid #000000",
                false, null,
                true, "2pt solid #000000"));

        totalHeaderLeft.setBorders(
            new Borders(
                false, null,
                true, "double solid #000000",
                true, "thin solid #000000",
                false, null));

        totalHeaderRight.setBorders(
            new Borders(
                false, null,
                true, "double solid #000000",
                false, null,
                true, "thin solid #000000"));

        thickRightBorder.setBorders(
            new Borders(
                false, null,
              false, null,
                false, null,
                true, "2pt solid #000000"));

        totalC.setBorders(
            new Borders(
                true, "2pt solid #000000",
                false, null,
                true, "2pt solid #000000",
                false, null)
        );

        totalC2.setBorders(
            new Borders(
                true, "2pt solid #000000",
                false, null,
                true, "thin solid #000000",
                false, null)
        );

        resultSep.setBorders(
            new Borders(
                true, "2pt solid #000000",
                false, null,
                false, null,
                false, null));
    }
}
