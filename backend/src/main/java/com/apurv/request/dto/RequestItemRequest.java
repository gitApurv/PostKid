package com.apurv.request.dto;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import com.apurv.request.entity.HttpMethod;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RequestItemRequest {

    @NotBlank(message = "Request Name is required")
    private String name;

    @NotNull(message = "Request Method is required")
    private HttpMethod method;

    @NotBlank(message = "Request URL is required")
    private String url;

    private String body;

    private Map<String, String> headers = new HashMap<>();

    @NotNull(message = "Collection ID is required")
    private UUID collectionId;

    private UUID folderId;

}
