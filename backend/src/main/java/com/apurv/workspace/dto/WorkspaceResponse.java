package com.apurv.workspace.dto;

import java.time.Instant;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WorkspaceResponse {

    private UUID id;
    private String name;
    private String description;
    private String ownerUsername;
    private int memberCount;
    private boolean isDefault;
    private Instant createdAt;
    private Instant updatedAt;

}
