package com.apurv.request.service;

import java.net.URI;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.reactive.function.client.WebClient.RequestBodySpec;
import org.springframework.web.reactive.function.client.WebClient.RequestHeadersSpec;

import com.apurv.auth.entity.User;
import com.apurv.history.service.HistoryService;
import com.apurv.request.dto.ExecutionRequest;
import com.apurv.request.dto.ExecutionResponse;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class RequestExecutionService {

        private final WebClient webClient;
        private final HistoryService historyService;

        public RequestExecutionService(WebClient.Builder webClientBuilder, HistoryService historyService) {
                this.webClient = webClientBuilder
                                .codecs(config -> config
                                                .defaultCodecs()
                                                .maxInMemorySize(10 * 1024 * 1024))
                                .build();
                this.historyService = historyService;
        }

        public ExecutionResponse executeRequest(ExecutionRequest request, User currentUser, UUID requestItemId) {
                long startTime = System.currentTimeMillis();
                ExecutionResponse response;

                try {
                        validateUrl(request.getUrl());

                        RequestBodySpec requestSpec = webClient
                                        .method(toSpringMethod(request.getMethod()))
                                        .uri(request.getUrl());

                        if (request.getHeaders() != null) {
                                request.getHeaders().forEach(requestSpec::header);
                        }

                        if (request.getAuthType() != null && request.getAuthValue() != null) {
                                if ("bearer".equalsIgnoreCase(request.getAuthType())) {
                                        String token = request.getAuthValue().get("token");
                                        if (token != null && !token.isBlank()) {
                                                requestSpec.header("Authorization", "Bearer " + token);
                                        }
                                } else if ("basic".equalsIgnoreCase(request.getAuthType())) {
                                        String username = request.getAuthValue().get("username");
                                        String password = request.getAuthValue().get("password");
                                        if (username != null && password != null) {
                                                String credentials = java.util.Base64.getEncoder().encodeToString(
                                                                (username + ":" + password).getBytes(
                                                                                java.nio.charset.StandardCharsets.UTF_8));
                                                requestSpec.header("Authorization", "Basic " + credentials);
                                        }
                                }
                        }

                        RequestHeadersSpec<?> headersSpec = requestSpec;

                        if (request.getBody() != null && !request.getBody().isBlank()) {
                                headersSpec = requestSpec
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .bodyValue(request.getBody());
                        }

                        ResponseEntity<String> httpResponse = headersSpec
                                        .retrieve()
                                        .onStatus(
                                                        status -> !status.is2xxSuccessful(),
                                                        clientResponse -> clientResponse.bodyToMono(String.class)
                                                                        .map(body -> new WebClientResponseException(
                                                                                        clientResponse.statusCode()
                                                                                                        .value(),
                                                                                        body, null,
                                                                                        null, null)))
                                        .toEntity(String.class)
                                        .timeout(Duration.ofSeconds(request.getTimeoutSeconds()))
                                        .block();

                        long duration = System.currentTimeMillis() - startTime;

                        Map<String, String> responseHeaders = new HashMap<>();
                        httpResponse.getHeaders()
                                        .forEach((key, values) -> responseHeaders.put(key, String.join(",", values)));

                        log.info("Request {} to {} completed in {} ms with status code {}", request.getMethod(),
                                        request.getUrl(),
                                        duration,
                                        httpResponse.getStatusCode().value());

                        response = ExecutionResponse.builder()
                                        .statusCode(httpResponse.getStatusCode().value())
                                        .responseHeaders(responseHeaders)
                                        .responseBody(httpResponse.getBody())
                                        .durationMs(duration)
                                        .success(true)
                                        .build();

                } catch (WebClientResponseException e) {
                        long duration = System.currentTimeMillis() - startTime;

                        log.warn("Request {} to {} failed in {} ms with status code {}",
                                        request.getMethod(),
                                        request.getUrl(), duration, e.getStatusCode().value());

                        response = ExecutionResponse.builder()
                                        .statusCode(e.getStatusCode().value())
                                        .responseBody(e.getResponseBodyAsString())
                                        .durationMs(duration)
                                        .success(false)
                                        .errorMessage("Execution failed: " + e.getMessage()).build();
                } catch (Exception e) {
                        long duration = System.currentTimeMillis() - startTime;

                        log.error("Request {} to {} failed in {} ms with error: {}",
                                        request.getMethod(),
                                        request.getUrl(),
                                        duration,
                                        e.getMessage());

                        response = ExecutionResponse.builder()
                                        .statusCode(0)
                                        .durationMs(duration)
                                        .success(false)
                                        .errorMessage("Execution failed: " + e.getMessage())
                                        .build();
                }

                historyService.saveHistory(request, response, currentUser, requestItemId);
                return response;
        }

        private HttpMethod toSpringMethod(com.apurv.request.entity.HttpMethod method) {
                return HttpMethod.valueOf(method.name());
        }

        private void validateUrl(String url) {
                try {
                        new URI(url).toURL();
                } catch (Exception e) {
                        throw new IllegalArgumentException("Invalid URL: " + url);
                }

        }
}
