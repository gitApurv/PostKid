package com.apurv.environment.dto;

import com.apurv.environment.entity.EnvironmentColor;
import com.mongodb.lang.NonNull;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EnvironmentRequest {

    @NotBlank(message = "Environment name must not be blank")
    private String name;

    @NonNull
    private EnvironmentColor environmentColor;
}
