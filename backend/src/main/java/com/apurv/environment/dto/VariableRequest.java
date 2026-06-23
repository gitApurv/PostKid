package com.apurv.environment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VariableRequest {

    @NotBlank(message = "Key must not be blank")
    private String key;

    @NotNull(message = "Value must not be null")
    private String value;

}
