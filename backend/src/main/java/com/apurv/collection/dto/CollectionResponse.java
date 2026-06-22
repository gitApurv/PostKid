package com.apurv.collection.dto;

import java.time.Instant;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectionResponse {

    private UUID id;
    private UUID workspaceId;
    private String name;
    private String description;
    private int folderCount;
    private Instant createdAt;
    private Instant updatedAt;

}
