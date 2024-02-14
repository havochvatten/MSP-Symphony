package se.havochvatten.symphony.util;

import com.github.miachm.sods.Borders;
import com.github.miachm.sods.Style;

public class ODSStyles {
    public static final Style
        cmpName         = new Style(),
        calcName        = new Style(),
        ecoHeader       = new Style(),
        pressureHeader  = new Style(),
        valueStyle      = new Style(),
        totalE          = new Style(),
        totalP          = new Style(),
        totalHE         = new Style(),
        totalHP         = new Style(),
        totalC          = new Style(),
        resultSep       = new Style();

    static {
        cmpName.setFontSize(14);
        cmpName.setVerticalTextAligment(Style.VERTICAL_TEXT_ALIGMENT.Middle);

        calcName.setBold(true);
        calcName.setUnderline(true);
        calcName.setFontSize(11);

        for (Style s : new Style[]
            { ecoHeader, pressureHeader, valueStyle, totalE,
                totalP, totalHE, totalHP, totalC, }) {
            s.setFontSize(10);
        }

        for (Style s : new Style[]
            { totalHE, totalHP, totalC }) {
            s.setBold(true);
            s.setItalic(true);
        }

        ecoHeader.setTextAligment(Style.TEXT_ALIGMENT.Right);
        ecoHeader.setBorders(
            new Borders(false, null,
                true, "thin solid #000000",
                false, null,
                true, "2pt solid #000000"));

        pressureHeader.setBorders(
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

        totalE.setItalic(true);
        totalE.setBorders(
            new Borders(
                false, null,
                true, "thin solid #000000",
                true, "thin double #000000",
                false, null));

        totalP.setItalic(true);
        totalP.setBorders(
            new Borders(
                true, "thin double #000000",
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
                true, "2pt solid #000000")
        );

        totalC.setBorders(
            new Borders(
                true, "2pt solid #000000",
                false, null,
                true, "2pt solid #000000",
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
