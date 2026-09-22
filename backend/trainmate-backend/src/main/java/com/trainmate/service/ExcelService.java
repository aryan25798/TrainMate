package com.trainmate.service;

import com.trainmate.allocation.TrainerAllocationService;
import com.trainmate.dto.CohortUploadResponse;
import com.trainmate.dto.ExcelValidationError;
import com.trainmate.entity.Cohort;
import com.trainmate.entity.CohortStatus;
import com.trainmate.entity.User;
import com.trainmate.exception.InvalidFileException;
import com.trainmate.repository.CohortRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.util.*;

@Service
public class ExcelService {

    private final CohortRepository cohortRepository;
    private final TrainerAllocationService trainerAllocationService;
    private final CohortService cohortService;

    private static final DateTimeFormatter[] DATE_FORMATTERS = new DateTimeFormatter[]{
            DateTimeFormatter.ofPattern("dd-MMM-yyyy", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("d-MMM-yyyy", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("yyyy/MM/dd")
    };

    public ExcelService(CohortRepository cohortRepository, TrainerAllocationService trainerAllocationService, CohortService cohortService) {
        this.cohortRepository = cohortRepository;
        this.trainerAllocationService = trainerAllocationService;
        this.cohortService = cohortService;
    }

    /**
     * Reads, validates, saves, and auto-allocates cohorts from an uploaded Excel file.
     */
    public CohortUploadResponse processCohortExcel(MultipartFile file, User coachUser) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("Please select an Excel file to upload.");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.toLowerCase().endsWith(".xlsx") && !filename.toLowerCase().endsWith(".xls"))) {
            throw new InvalidFileException("Unsupported file format. Please upload an Excel file (.xlsx).");
        }

        List<ExcelValidationError> errors = new ArrayList<>();
        List<Cohort> validCohorts = new ArrayList<>();
        Set<String> seenCodesInBatch = new HashSet<>();
        int totalRows = 0;

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            // Skip header row
            if (rowIterator.hasNext()) {
                rowIterator.next();
            }

            int rowNumber = 1; // 1-based index (Header is row 1, data starts row 2)

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                rowNumber++;

                // If entire row is empty, skip
                if (isRowEmpty(row)) {
                    continue;
                }

                totalRows++;

                // Read columns
                String cohortCode = getCellStringValue(row.getCell(0));
                String serviceLine = getCellStringValue(row.getCell(1));
                String stream = getCellStringValue(row.getCell(2));
                String requiredSkill = getCellStringValue(row.getCell(3));
                String traineesStr = getCellStringValue(row.getCell(4));
                LocalDate startDate = getCellDateValue(row.getCell(5));
                LocalDate endDate = getCellDateValue(row.getCell(6));
                String vertical = getCellStringValue(row.getCell(7));
                String location = getCellStringValue(row.getCell(8));

                boolean rowHasError = false;

                // Rule 1: Cohort Code validation
                if (cohortCode == null || cohortCode.trim().isEmpty()) {
                    errors.add(new ExcelValidationError(rowNumber, "Cohort code is required"));
                    rowHasError = true;
                } else {
                    cohortCode = cohortCode.trim();
                    if (seenCodesInBatch.contains(cohortCode.toUpperCase())) {
                        errors.add(new ExcelValidationError(rowNumber, "Duplicate cohort code within file: " + cohortCode));
                        rowHasError = true;
                    } else if (cohortRepository.existsByCohortCode(cohortCode)) {
                        errors.add(new ExcelValidationError(rowNumber, "Cohort code already exists: " + cohortCode));
                        rowHasError = true;
                    } else {
                        seenCodesInBatch.add(cohortCode.toUpperCase());
                    }
                }

                // Rule 2: Required Skill validation
                if (requiredSkill == null || requiredSkill.trim().isEmpty()) {
                    errors.add(new ExcelValidationError(rowNumber, "Required skill is required"));
                    rowHasError = true;
                }

                // Rule 3: Number of Trainees validation
                Integer trainees = null;
                try {
                    if (traineesStr == null || traineesStr.trim().isEmpty()) {
                        errors.add(new ExcelValidationError(rowNumber, "Number of trainees is required"));
                        rowHasError = true;
                    } else {
                        // Handle possible float strings from Excel numeric cells like "50.0"
                        double val = Double.parseDouble(traineesStr.trim());
                        trainees = (int) val;
                        if (trainees <= 0) {
                            errors.add(new ExcelValidationError(rowNumber, "Number of trainees must be greater than zero"));
                            rowHasError = true;
                        }
                    }
                } catch (NumberFormatException e) {
                    errors.add(new ExcelValidationError(rowNumber, "Number of trainees must be numeric"));
                    rowHasError = true;
                }

                // Rule 4: Start Date validation
                if (startDate == null) {
                    errors.add(new ExcelValidationError(rowNumber, "Start date is required (format: DD-MMM-YYYY or YYYY-MM-DD)"));
                    rowHasError = true;
                }

                // Rule 5: End Date validation
                if (endDate == null) {
                    errors.add(new ExcelValidationError(rowNumber, "End date is required (format: DD-MMM-YYYY or YYYY-MM-DD)"));
                    rowHasError = true;
                } else if (startDate != null && endDate.isBefore(startDate)) {
                    errors.add(new ExcelValidationError(rowNumber, "End date cannot be before start date"));
                    rowHasError = true;
                }

                if (!rowHasError) {
                    Cohort cohort = new Cohort();
                    cohort.setCohortCode(cohortCode);
                    cohort.setServiceLine(serviceLine != null && !serviceLine.trim().isEmpty() ? serviceLine.trim() : "General");
                    cohort.setStream(stream != null && !stream.trim().isEmpty() ? stream.trim() : "Software Development");
                    cohort.setRequiredSkill(requiredSkill.trim());
                    cohort.setTraineeCount(trainees);
                    cohort.setStartDate(startDate);
                    cohort.setEndDate(endDate);
                    cohort.setLocation(location != null && !location.trim().isEmpty() ? location.trim() : "Chennai");
                    cohort.setCoachUser(coachUser);
                    cohort.setStatus(CohortStatus.PENDING);

                    validCohorts.add(cohort);
                }
            }

        } catch (IOException e) {
            throw new InvalidFileException("Failed to read Excel file: " + e.getMessage());
        }

        int successfulRows = 0;
        List<com.trainmate.dto.CohortResponse> allocatedCohorts = new ArrayList<>();
        // Save and allocate each valid cohort
        for (Cohort cohort : validCohorts) {
            Cohort saved = cohortRepository.save(cohort);
            trainerAllocationService.allocateTrainer(saved);
            allocatedCohorts.add(cohortService.mapToResponse(saved));
            successfulRows++;
        }

        int failedRows = totalRows - successfulRows;

        return new CohortUploadResponse(totalRows, successfulRows, failedRows, errors, allocatedCohorts);
    }

    /**
     * Generates a downloadable sample Excel template (.xlsx) with header styles and example rows.
     */
    public byte[] generateSampleExcelTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Cohort Template");

            // Header Font & Style
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerCellStyle.setAlignment(HorizontalAlignment.CENTER);

            // Columns matching FRD Section 15
            String[] headers = {
                    "Cohort Code",
                    "Service Line",
                    "Stream",
                    "Required Skill",
                    "Number of Trainees",
                    "Start Date",
                    "End Date",
                    "Vertical",
                    "Location",
                    "Coach Name"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerCellStyle);
            }

            // Sample rows matching FRD Section 15 & 83
            String[][] sampleData = {
                    {"QEA26SD004", "QEA", "Software Development", "Java, Spring Boot", "50", "01-Sep-2026", "30-Nov-2026", "Healthcare", "Chennai", "Amit Sharma"},
                    {"QEA26SD005", "QEA", "Frontend Engineering", "Angular", "40", "05-Sep-2026", "30-Nov-2026", "Banking", "Chennai", "Amit Sharma"},
                    {"QEA26SD006", "QEA", "Enterprise Java", "Java, SQL", "35", "10-Sep-2026", "10-Dec-2026", "Insurance", "Pune", "Amit Sharma"}
            };

            int rowIdx = 1;
            for (String[] rowData : sampleData) {
                Row row = sheet.createRow(rowIdx++);
                for (int col = 0; col < rowData.length; col++) {
                    row.createCell(col).setCellValue(rowData[col]);
                }
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String val = getCellStringValue(cell);
                if (val != null && !val.trim().isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    LocalDate date = cell.getDateCellValue().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                    return date.format(DateTimeFormatter.ofPattern("dd-MMM-yyyy", Locale.ENGLISH));
                }
                double num = cell.getNumericCellValue();
                if (num == (long) num) {
                    return String.valueOf((long) num);
                } else {
                    return String.valueOf(num);
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            default:
                return null;
        }
    }

    private LocalDate getCellDateValue(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            Date date = cell.getDateCellValue();
            return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        }

        String str = getCellStringValue(cell);
        if (str == null || str.trim().isEmpty()) {
            return null;
        }

        str = str.trim();
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(str, formatter);
            } catch (Exception ignored) {
            }
        }
        return null;
    }
}
