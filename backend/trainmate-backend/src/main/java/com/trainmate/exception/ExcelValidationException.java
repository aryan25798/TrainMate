package com.trainmate.exception;

import com.trainmate.dto.ExcelValidationError;
import java.util.List;

public class ExcelValidationException extends RuntimeException {
    private final List<ExcelValidationError> errors;

    public ExcelValidationException(String message, List<ExcelValidationError> errors) {
        super(message);
        this.errors = errors;
    }

    public List<ExcelValidationError> getErrors() {
        return errors;
    }
}
