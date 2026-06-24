package com.apurv.history.document;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "request_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestHistory {

    @Id
    private String id;

    @Indexed
    private UUID userId;

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
    private Long durationMs;
    private boolean success;
    private String errorMessage;

    @CreatedDate
    @Indexed
    private Instant executedAt;

}
