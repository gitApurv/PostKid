package com.apurv.collection.controller;

import java.util.List;
import java.util.UUID;

import com.apurv.auth.entity.User;
import com.apurv.collection.dto.CollectionRequest;
import com.apurv.collection.dto.CollectionResponse;
import com.apurv.collection.dto.FolderRequest;
import com.apurv.collection.dto.FolderResponse;
import com.apurv.collection.service.CollectionService;
import com.apurv.common.dto.ApiResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;

    @PostMapping
    public ResponseEntity<ApiResponse<CollectionResponse>> createCollection(
            @Valid @RequestBody CollectionRequest request,
            @AuthenticationPrincipal User currentUser) {
        CollectionResponse response = collectionService.createCollection(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Collection created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CollectionResponse>>> getAllCollections(
            @AuthenticationPrincipal User currentUser) {
        List<CollectionResponse> collections = collectionService.getAllCollections(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Collections fetched successfully", collections));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CollectionResponse>> getCollectionById(@PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        CollectionResponse collection = collectionService.getCollectionById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Collection fetched successfully", collection));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CollectionResponse>> updateCollection(@PathVariable UUID id,
            @Valid @RequestBody CollectionRequest request,
            @AuthenticationPrincipal User currentUser) {
        CollectionResponse response = collectionService.updateCollection(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Collection updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCollection(@PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        collectionService.deleteCollection(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Collection deleted successfully", null));
    }

    @PostMapping("/{collectionId}/folders")
    public ResponseEntity<ApiResponse<FolderResponse>> createFolder(@PathVariable UUID collectionId,
            @Valid @RequestBody FolderRequest request,
            @AuthenticationPrincipal User currentUser) {
        FolderResponse response = collectionService.createFolder(collectionId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Folder created successfully", response));
    }

    @GetMapping("/{collectionId}/folders")
    public ResponseEntity<ApiResponse<List<FolderResponse>>> getParentFolders(@PathVariable UUID collectionId,
            @AuthenticationPrincipal User currentUser) {
        List<FolderResponse> folders = collectionService.getParentFolders(collectionId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Parent folders fetched successfully", folders));
    }

    @GetMapping("/{collectionId}/folders/{folderId}/subfolders")
    public ResponseEntity<ApiResponse<List<FolderResponse>>> getSubFolders(@PathVariable UUID collectionId,
            @PathVariable UUID folderId,
            @AuthenticationPrincipal User currentUser) {
        List<FolderResponse> folders = collectionService.getSubFolders(collectionId, folderId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Subfolders fetched successfully", folders));
    }

    @DeleteMapping("/{collectionId}/folders/{folderId}")
    public ResponseEntity<ApiResponse<Void>> deleteFolder(@PathVariable UUID collectionId,
            @PathVariable UUID folderId,
            @AuthenticationPrincipal User currentUser) {
        collectionService.deleteFolder(collectionId, folderId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Folder deleted successfully", null));
    }
}