package com.trainmate.dto;

import java.util.ArrayList;
import java.util.List;

public class CohortUploadResponse {
    private int totalRows;
    private int successfulRows;
    private int failedRows;
    private List<ExcelValidationError> errors;

    public CohortUploadResponse() {
        this.errors = new ArrayList<>();
    }

    public CohortUploadResponse(int totalRows, int successfulRows, int failedRows, List<ExcelValidationError> errors) {
        this.totalRows = totalRows;
        this.successfulRows = successfulRows;
        this.failedRows = failedRows;
        this.errors = errors != null ? errors : new ArrayList<>();
    }

    public int getTotalRows() {
        return totalRows;
    }

    public void setTotalRows(int totalRows) {
        this.totalRows = totalRows;
    }

    public int getSuccessfulRows() {
        return successfulRows;
    }

    public void setSuccessfulRows(int successfulRows) {
        this.successfulRows = successfulRows;
    }

    public int getFailedRows() {
        return failedRows;
    }

    public void setFailedRows(int failedRows) {
        this.failedRows = failedRows;
    }

    public List<ExcelValidationError> getErrors() {
        return errors;
    }

    public void setErrors(List<ExcelValidationError> errors) {
        this.errors = errors;
    }
}
