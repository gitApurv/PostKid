package com.apurv.history.dto;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HistoryResponse {

    private String id;
    private UUID userId;
    private UUID requestItemId;
    private UUID collectionId;

    private String method;
    private String url;
    private Map<String, String> requestHeaders;
    private String requestBody;
    private String authType;
    private Map<String, String> authValue;
    private int timeoutSeconds;

    private int statusCode;
    private Map<String, String> responseHeaders;
    private String responseBody;
    private long durationMs;
    private boolean success;
    private String errorMessage;

    private Instant executedAt;
}
