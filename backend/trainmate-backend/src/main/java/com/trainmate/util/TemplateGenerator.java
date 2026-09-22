package com.trainmate.util;

import com.trainmate.service.ExcelService;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

public class TemplateGenerator {
    public static void main(String[] args) throws Exception {
        ExcelService excelService = new ExcelService(null, null, null);
        byte[] bytes = excelService.generateSampleExcelTemplate();
        Files.createDirectories(Paths.get("../../sample-data"));
        try (FileOutputStream fos = new FileOutputStream("../../sample-data/cohort-template.xlsx")) {
            fos.write(bytes);
        }
        System.out.println("Sample template successfully created at sample-data/cohort-template.xlsx");
    }
}
