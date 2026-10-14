package com.trainmate.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class BulkDeleteRequest {

    @NotEmpty(message = "List of IDs cannot be empty")
    private List<Long> ids;

    public BulkDeleteRequest() {}

    public BulkDeleteRequest(List<Long> ids) {
        this.ids = ids;
    }

    public List<Long> getIds() {
        return ids;
    }

    public void setIds(List<Long> ids) {
        this.ids = ids;
    }
}
