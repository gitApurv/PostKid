package com.apurv.request.dto;

import java.util.HashMap;
import java.util.Map;

import com.apurv.request.entity.HttpMethod;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ExecutionRequest {

    @NotBlank(message = "URL is required")
    private String url;

    @NotBlank(message = "HTTP method is required")
    private HttpMethod method;

    private Map<String, String> headers = new HashMap<>();

    private String body;

    private int timeoutSeconds = 30;
}
