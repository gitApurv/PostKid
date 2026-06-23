package com.apurv.environment.dto;

import com.apurv.environment.entity.EnvironmentColor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EnvironmentRequest {

    @NotBlank(message = "Environment name must not be blank")
    private String name;

    @NotNull
    private EnvironmentColor environmentColor;

}
