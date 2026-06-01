package com.apurv.environment.dto;

import java.util.List;
import java.util.UUID;
import java.util.ArrayList;
import java.time.Instant;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EnvironmentResponse {

    private UUID id;
    private String name;
    private UUID ownerId;
    @Builder.Default
    private List<VariableResponse> variables = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;
}
