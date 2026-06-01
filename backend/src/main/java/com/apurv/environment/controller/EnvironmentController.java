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
import com.apurv.environment.dto.VariableRequest;
import com.apurv.environment.dto.VariableResponse;
import com.apurv.environment.service.EnvironmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/environments")
@RequiredArgsConstructor
public class EnvironmentController {

    private final EnvironmentService environmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<EnvironmentResponse>> createEnvironment(@Valid @RequestBody EnvironmentRequest request,
            @AuthenticationPrincipal User currentUser) {
        EnvironmentResponse response = environmentService.createEnvironment(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Environment created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EnvironmentResponse>>> getAllEnvironments(
            @AuthenticationPrincipal User currentUser) {
        List<EnvironmentResponse> response = environmentService.getAllEnvironments(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Environments fetched successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EnvironmentResponse>> updateEnvironment(@PathVariable UUID id,
            @Valid @RequestBody EnvironmentRequest request,
            @AuthenticationPrincipal User currentUser) {
        EnvironmentResponse response = environmentService.updateEnvironment(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Environment updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEnvironment(@PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        environmentService.deleteEnvironment(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Environment deleted successfully", null));
    }

    @PostMapping("/{id}/variables")
    public ResponseEntity<ApiResponse<VariableResponse>> addVariable(@PathVariable UUID id,
            @Valid @RequestBody VariableRequest request,
            @AuthenticationPrincipal User currentUser) {
        VariableResponse response = environmentService.addVariable(id, request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Variable created successfully", response));
    }

    @DeleteMapping("/{id}/variables/{varId}")
    public ResponseEntity<ApiResponse<Void>> deleteVariable(@PathVariable UUID id, @PathVariable UUID varId,
            @AuthenticationPrincipal User currentUser) {
        environmentService.deleteVariable(id, varId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Variable deleted successfully", null));
    }
}