package com.apurv.environment.dto;

import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VariableResponse {

    private UUID id;
    private String key;
    private String value;
    private boolean secret;
}
