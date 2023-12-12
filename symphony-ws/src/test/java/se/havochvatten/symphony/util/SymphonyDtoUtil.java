package se.havochvatten.symphony.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import se.havochvatten.symphony.dto.SensMatrixDto;
import se.havochvatten.symphony.dto.SensitivityMatrix;
import se.havochvatten.symphony.entity.Metadata;
import se.havochvatten.symphony.entity.Sensitivity;
import se.havochvatten.symphony.entity.SymphonyBand;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.List;
import java.util.stream.Collectors;

public class SymphonyDtoUtil {
    public static SensMatrixDto createSensMatrixDto(String matrixName) throws IOException {
        File sourceFile = new File("src/test/resources/matrices/sensmatrixdto.json");
        List<String> rows = Files.readAllLines(sourceFile.toPath(), StandardCharsets.UTF_8);
        String sensMatrixString = rows.stream().collect(Collectors.joining(""));
        sensMatrixString = String.format(sensMatrixString, matrixName);
		return new ObjectMapper().readValue(sensMatrixString, SensMatrixDto.class);
    }

    public static List<Sensitivity> commonSensitivities() {
        SymphonyBand pressureBand1 = new SymphonyBand();
        pressureBand1.setId(79);
        pressureBand1.setBandNumber(1);
        pressureBand1.setCategory("Pressure");

        Metadata pressureTitle1 = new Metadata();
        pressureTitle1.setBand(pressureBand1);
        pressureTitle1.setLanguage("sv");
        pressureTitle1.setMetaField("title");
        pressureTitle1.setMetaValue("Explosioner maximaltryck (peak maximum pressure)");

        SymphonyBand ecoBand1 = new SymphonyBand();
        ecoBand1.setId(32);
        ecoBand1.setBandNumber(1);
        ecoBand1.setCategory("Ecosystem");

        Metadata ecoTitle1 = new Metadata();
        ecoTitle1.setBand(ecoBand1);
        ecoTitle1.setLanguage("sv");
        ecoTitle1.setMetaField("title");
        ecoTitle1.setMetaValue("Tumlare Bälthavet");

        SymphonyBand pressureBand2 = new SymphonyBand();
        pressureBand2.setId(66);
        pressureBand2.setBandNumber(2);
        pressureBand2.setCategory("Pressure");

        Metadata pressureTitle2 = new Metadata();
        pressureTitle2.setBand(pressureBand2);
        pressureTitle2.setLanguage("sv");
        pressureTitle2.setMetaField("title");
        pressureTitle2.setMetaValue("Explosioner ljudnivå (Sound Exposure Level)");

        SymphonyBand ecoBand2 = new SymphonyBand();
        ecoBand2.setId(24);
        ecoBand2.setBandNumber(2);
        ecoBand2.setCategory("Ecosystem");

        Metadata ecoTitle2 = new Metadata();
        ecoTitle2.setBand(ecoBand2);
        ecoTitle2.setLanguage("sv");
        ecoTitle2.setMetaField("title");
        ecoTitle2.setMetaValue("Tumlare Nordsjön");

        pressureBand1.getMetaValues().add(pressureTitle1);
        pressureBand2.getMetaValues().add(pressureTitle2);
        ecoBand1.getMetaValues().add(ecoTitle1);
        ecoBand2.getMetaValues().add(ecoTitle2);

        Sensitivity sensitivity11 = new Sensitivity();
        sensitivity11.setId(11);
        sensitivity11.setPressureBand(pressureBand1);
        sensitivity11.setEcoBand(ecoBand1);
        sensitivity11.setValue(BigDecimal.valueOf(0.1));

        Sensitivity sensitivity12 = new Sensitivity();
        sensitivity12.setId(12);
        sensitivity12.setPressureBand(pressureBand1);
        sensitivity12.setEcoBand(ecoBand2);
        sensitivity12.setValue(BigDecimal.valueOf(0.2));

        Sensitivity sensitivity21 = new Sensitivity();
        sensitivity21.setId(21);
        sensitivity21.setPressureBand(pressureBand2);
        sensitivity21.setEcoBand(ecoBand1);
        sensitivity21.setValue(BigDecimal.valueOf(0.3));

        Sensitivity sensitivity22 = new Sensitivity();
        sensitivity22.setId(22);
        sensitivity22.setPressureBand(pressureBand2);
        sensitivity22.setEcoBand(ecoBand2);
        sensitivity22.setValue(BigDecimal.valueOf(0.4));

        return List.of(sensitivity11, sensitivity12, sensitivity21, sensitivity22);
    }
}
