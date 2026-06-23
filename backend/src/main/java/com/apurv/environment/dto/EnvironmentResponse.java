package com.apurv.environment.dto;

import java.util.List;
import java.util.ArrayList;
import java.util.UUID;

import com.apurv.environment.entity.EnvironmentColor;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentResponse {

    private UUID id;
    private UUID collectionId;
    private String name;
    private EnvironmentColor environmentColor;
    @Builder.Default
    private List<VariableResponse> variables = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;

}
