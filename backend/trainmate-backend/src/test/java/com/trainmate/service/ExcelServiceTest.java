package com.trainmate.service;

import com.trainmate.allocation.TrainerAllocationService;
import com.trainmate.dto.CohortResponse;
import com.trainmate.dto.CohortUploadResponse;
import com.trainmate.entity.Cohort;
import com.trainmate.entity.Role;
import com.trainmate.entity.User;
import com.trainmate.exception.InvalidFileException;
import com.trainmate.repository.CohortRepository;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExcelServiceTest {

    @Mock
    private CohortRepository cohortRepository;

    @Mock
    private TrainerAllocationService trainerAllocationService;

    @Mock
    private CohortService cohortService;

    @InjectMocks
    private ExcelService excelService;

    private User coach;

    @BeforeEach
    void setUp() {
        coach = new User(1L, "Coach Amit", "coach@cognizant.com", "pass", Role.COACH);
    }

    private byte[] createTestExcelBytes(List<String[]> dataRows) throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Cohorts");

            // Header row
            Row header = sheet.createRow(0);
            String[] headers = {
                    "Cohort Code", "Service Line", "Stream", "Required Skill",
                    "Number of Trainees", "Start Date", "End Date", "Vertical", "Location"
            };
            for (int i = 0; i < headers.length; i++) {
                header.createCell(i).setCellValue(headers[i]);
            }

            // Data rows
            for (int r = 0; r < dataRows.size(); r++) {
                Row row = sheet.createRow(r + 1);
                String[] values = dataRows.get(r);
                for (int c = 0; c < values.length; c++) {
                    row.createCell(c).setCellValue(values[c]);
                }
            }

            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    @Test
    void testProcessCohortExcel_NullOrEmptyFile_ThrowsInvalidFileException() {
        assertThrows(InvalidFileException.class, () ->
                excelService.processCohortExcel(null, coach)
        );

        MockMultipartFile emptyFile = new MockMultipartFile("file", "test.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", new byte[0]);
        assertThrows(InvalidFileException.class, () ->
                excelService.processCohortExcel(emptyFile, coach)
        );
    }

    @Test
    void testProcessCohortExcel_NonExcelExtension_ThrowsInvalidFileException() {
        MockMultipartFile txtFile = new MockMultipartFile("file", "test.txt", "text/plain", "data".getBytes());
        assertThrows(InvalidFileException.class, () ->
                excelService.processCohortExcel(txtFile, coach)
        );
    }

    @Test
    void testProcessCohortExcel_ValidRow_SavesAndAllocates() throws IOException {
        List<String[]> rows = new ArrayList<>();
        rows.add(new String[]{"CH_JAVA_01", "ADM", "Java FSD", "Java, Spring Boot", "25", "10-Nov-2026", "20-Dec-2026", "BFSI", "Pune"});
        byte[] excelBytes = createTestExcelBytes(rows);
        MockMultipartFile file = new MockMultipartFile("file", "cohorts.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelBytes);

        when(cohortRepository.existsByCohortCode("CH_JAVA_01")).thenReturn(false);
        when(cohortRepository.save(any(Cohort.class))).thenAnswer(inv -> {
            Cohort c = inv.getArgument(0);
            c.setId(100L);
            return c;
        });
        when(cohortRepository.findById(100L)).thenReturn(Optional.of(new Cohort()));

        CohortResponse res = new CohortResponse();
        res.setId(100L);
        res.setCohortCode("CH_JAVA_01");
        when(cohortService.mapToResponse(any(Cohort.class))).thenReturn(res);

        CohortUploadResponse response = excelService.processCohortExcel(file, coach);

        assertNotNull(response);
        assertEquals(1, response.getTotalRows());
        assertEquals(1, response.getSuccessfulRows());
        assertEquals(0, response.getFailedRows());
        assertTrue(response.getErrors().isEmpty());

        verify(cohortRepository).save(any(Cohort.class));
        verify(trainerAllocationService).allocateTrainer(any(Cohort.class));
    }

    @Test
    void testProcessCohortExcel_DuplicateInBatch_FlagsError() throws IOException {
        List<String[]> rows = new ArrayList<>();
        rows.add(new String[]{"CH_DUP_01", "ADM", "Java", "Java", "20", "10-Nov-2026", "20-Dec-2026", "BFSI", "Pune"});
        rows.add(new String[]{"CH_DUP_01", "ADM", "Java", "Java", "20", "10-Nov-2026", "20-Dec-2026", "BFSI", "Pune"});
        byte[] excelBytes = createTestExcelBytes(rows);
        MockMultipartFile file = new MockMultipartFile("file", "cohorts.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelBytes);

        when(cohortRepository.existsByCohortCode("CH_DUP_01")).thenReturn(false);
        when(cohortRepository.save(any(Cohort.class))).thenAnswer(inv -> {
            Cohort c = inv.getArgument(0);
            c.setId(101L);
            return c;
        });
        when(cohortRepository.findById(101L)).thenReturn(Optional.of(new Cohort()));

        CohortResponse res = new CohortResponse();
        res.setId(101L);
        res.setCohortCode("CH_DUP_01");
        when(cohortService.mapToResponse(any(Cohort.class))).thenReturn(res);

        CohortUploadResponse response = excelService.processCohortExcel(file, coach);

        assertNotNull(response);
        assertEquals(2, response.getTotalRows());
        assertEquals(1, response.getSuccessfulRows());
        assertEquals(1, response.getFailedRows());
        assertEquals(1, response.getErrors().size());
        assertTrue(response.getErrors().get(0).getMessage().contains("Duplicate cohort code within file"));
    }

    @Test
    void testGenerateSampleExcelTemplate_ReturnsValidBytes() throws IOException {
        byte[] sampleBytes = excelService.generateSampleExcelTemplate();
        assertNotNull(sampleBytes);
        assertTrue(sampleBytes.length > 0);
    }
}
