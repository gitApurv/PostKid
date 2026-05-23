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
public class FolderResponse {

    private UUID id;
    private String name;
    private UUID collectionId;
    private UUID parentFolderId;
    private int subFolderCount;
    private Instant createdAt;
}