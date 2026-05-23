package com.apurv.collection.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FolderRequest {

    @NotBlank(message = "Folder name is required")
    @Size(max = 100, message = "Folder name must not exceed 100 characters")
    private String name;

    private UUID parentFolderId;
}