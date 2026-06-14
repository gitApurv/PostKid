package com.apurv.workspace.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WorkspaceRequest {

    @NotBlank
    private String name;
    private String description;
}
