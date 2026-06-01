package com.apurv.environment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EnvironmentRequest {

    @NotBlank(message = "Environment name must not be blank")
    private String name;
}
