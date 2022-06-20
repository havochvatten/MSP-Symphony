package se.havochvatten.symphony.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import se.havochvatten.symphony.dto.SensMatrixDto;

import java.io.File;
import java.io.IOException;
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
}
