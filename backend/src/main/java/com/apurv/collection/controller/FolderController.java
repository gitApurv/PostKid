package com.apurv.collection.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apurv.auth.entity.User;
import com.apurv.collection.dto.FolderRequest;
import com.apurv.collection.dto.FolderResponse;
import com.apurv.collection.service.FolderService;
import com.apurv.common.dto.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/collections/{collectionId}/folders")
@RequiredArgsConstructor
public class FolderController {

        private final FolderService folderService;

        @PostMapping()
        public ResponseEntity<ApiResponse<FolderResponse>> createFolder(
                        @PathVariable UUID workspaceId,
                        @PathVariable UUID collectionId,
                        @Valid @RequestBody FolderRequest request,
                        @AuthenticationPrincipal User currentUser) {

                FolderResponse response = folderService.createFolder(
                                workspaceId,
                                collectionId,
                                request,
                                currentUser);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success("Folder created successfully", response));
        }

        @GetMapping()
        public ResponseEntity<ApiResponse<List<FolderResponse>>> getParentFolders(
                        @PathVariable UUID workspaceId,
                        @PathVariable UUID collectionId,
                        @AuthenticationPrincipal User currentUser) {

                List<FolderResponse> folders = folderService.getParentFolders(
                                workspaceId,
                                collectionId,
                                currentUser);
                return ResponseEntity.ok(ApiResponse.success("Parent folders fetched successfully", folders));
        }

        @GetMapping("/{folderId}/subfolders")
        public ResponseEntity<ApiResponse<List<FolderResponse>>> getSubFolders(
                        @PathVariable UUID workspaceId,
                        @PathVariable UUID collectionId,
                        @PathVariable UUID folderId,
                        @AuthenticationPrincipal User currentUser) {

                List<FolderResponse> folders = folderService.getSubFolders(
                                workspaceId,
                                collectionId,
                                folderId,
                                currentUser);
                return ResponseEntity.ok(ApiResponse.success("Subfolders fetched successfully", folders));
        }

        @DeleteMapping("/{folderId}")
        public ResponseEntity<ApiResponse<Void>> deleteFolder(
                        @PathVariable UUID workspaceId,
                        @PathVariable UUID collectionId,
                        @PathVariable UUID folderId,
                        @AuthenticationPrincipal User currentUser) {

                folderService.deleteFolder(
                                workspaceId,
                                collectionId,
                                folderId,
                                currentUser);
                return ResponseEntity.ok(ApiResponse.success("Folder deleted successfully", null));
        }

}
