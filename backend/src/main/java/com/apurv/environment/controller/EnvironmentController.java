package com.apurv.environment.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apurv.auth.entity.User;
import com.apurv.common.dto.ApiResponse;
import com.apurv.environment.dto.EnvironmentRequest;
import com.apurv.environment.dto.EnvironmentResponse;
import com.apurv.environment.service.EnvironmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/collections/{collectionId}/environments")
@RequiredArgsConstructor
public class EnvironmentController {

        private final EnvironmentService environmentService;

        @PostMapping
        public ResponseEntity<ApiResponse<EnvironmentResponse>> createEnvironment(
                        @PathVariable UUID workspaceId,
                        @PathVariable UUID collectionId,
                        @Valid @RequestBody EnvironmentRequest request,
                        @AuthenticationPrincipal User currentUser) {

                EnvironmentResponse response = environmentService.createEnvironment(workspaceId, collectionId, request,
                                currentUser);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success("Environment created successfully", response));
        }

        @GetMapping
        public ResponseEntity<ApiResponse<List<EnvironmentResponse>>> getAllEnvironments(
                        @PathVariable UUID workspaceId,
                        @PathVariable UUID collectionId,
                        @AuthenticationPrincipal User currentUser) {

                List<EnvironmentResponse> response = environmentService.getAllEnvironments(workspaceId, collectionId,
                                currentUser);
                return ResponseEntity.ok(ApiResponse.success("Environments fetched successfully", response));
        }

        @PutMapping("/{environmentId}")
        public ResponseEntity<ApiResponse<EnvironmentResponse>> updateEnvironment(
                        @PathVariable UUID workspaceId,
                        @PathVariable UUID collectionId,
                        @PathVariable UUID environmentId,
                        @Valid @RequestBody EnvironmentRequest request,
                        @AuthenticationPrincipal User currentUser) {

                EnvironmentResponse response = environmentService.updateEnvironment(workspaceId, collectionId,
                                environmentId,
                                request,
                                currentUser);
                return ResponseEntity.ok(ApiResponse.success("Environment updated successfully", response));
        }

        @DeleteMapping("/{environmentId}")
        public ResponseEntity<ApiResponse<Void>> deleteEnvironment(
                        @PathVariable UUID workspaceId,
                        @PathVariable UUID collectionId,
                        @PathVariable UUID environmentId,
                        @AuthenticationPrincipal User currentUser) {

                environmentService.deleteEnvironment(workspaceId, collectionId, environmentId, currentUser);
                return ResponseEntity.ok(ApiResponse.success("Environment deleted successfully", null));
        }

}