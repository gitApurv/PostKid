package com.apurv.workspace.controller;

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
import com.apurv.workspace.dto.InviteMemberRequest;
import com.apurv.workspace.dto.MemberResponse;
import com.apurv.workspace.dto.WorkspaceRequest;
import com.apurv.workspace.dto.WorkspaceResponse;
import com.apurv.workspace.service.WorkspaceService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @PostMapping
    public ResponseEntity<ApiResponse<WorkspaceResponse>> createWorkspace(
            @Valid @RequestBody WorkspaceRequest request,
            @AuthenticationPrincipal User currentUser) {
        WorkspaceResponse response = workspaceService.createWorkspace(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Workspace created", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkspaceResponse>>> getAllWorkspaces(
            @AuthenticationPrincipal User currentUser) {
        List<WorkspaceResponse> response = workspaceService.getAllWorkspaces(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Workspaces fetched", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkspaceResponse>> getWorkspaceById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        WorkspaceResponse response = workspaceService.getWorkspaceById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Workspace fetched", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkspaceResponse>> updateWorkspace(
            @PathVariable UUID id,
            @Valid @RequestBody WorkspaceRequest request,
            @AuthenticationPrincipal User currentUser) {
        WorkspaceResponse response = workspaceService.updateWorkspace(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Workspace updated", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWorkspace(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        workspaceService.deleteWorkspace(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Workspace deleted", null));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ApiResponse<MemberResponse>> inviteMember(
            @PathVariable UUID id,
            @Valid @RequestBody InviteMemberRequest request,
            @AuthenticationPrincipal User currentUser) {
        MemberResponse response = workspaceService.inviteMember(id, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Member invited", response));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable UUID id,
            @PathVariable UUID userId,
            @AuthenticationPrincipal User currentUser) {
        workspaceService.removeMember(id, userId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Member removed", null));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<MemberResponse>>> getMembers(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        List<MemberResponse> response = workspaceService.getMembers(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Members fetched", response));
    }
}
