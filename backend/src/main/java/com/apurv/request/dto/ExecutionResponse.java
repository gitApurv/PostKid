package com.apurv.request.dto;

import java.util.Map;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExecutionResponse {

    private int statusCode;
    private Map<String, String> responseHeaders;
    private String responseBody;
    private long durationMs;
    private String errorMessage;
    private boolean success;
}
