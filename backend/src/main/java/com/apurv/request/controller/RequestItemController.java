package com.apurv.request.controller;

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
import com.apurv.request.dto.ExecutionRequest;
import com.apurv.request.dto.ExecutionResponse;
import com.apurv.request.dto.RequestItemRequest;
import com.apurv.request.dto.RequestItemResponse;
import com.apurv.request.service.RequestExecutionService;
import com.apurv.request.service.RequestItemService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/requests")
@RequiredArgsConstructor
public class RequestItemController {

    private final RequestItemService requestItemService;
    private final RequestExecutionService requestExecutionService;

    @PostMapping("/execute")
    public ResponseEntity<ApiResponse<ExecutionResponse>> executeRequest(@Valid @RequestBody ExecutionRequest request,
            @AuthenticationPrincipal User currentUser) {
        ExecutionResponse response = requestExecutionService.executeRequest(request, currentUser, null);
        return ResponseEntity.ok(ApiResponse.success("Request executed successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RequestItemResponse>> createRequestItem(
            @Valid @RequestBody RequestItemRequest request,
            @AuthenticationPrincipal User currentUser) {
        RequestItemResponse response = requestItemService.createRequestItem(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Request item created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RequestItemResponse>> getRequestById(@PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        RequestItemResponse response = requestItemService.getRequestById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Request item fetched successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RequestItemResponse>> updateRequestItem(@PathVariable UUID id,
            @Valid @RequestBody RequestItemRequest request,
            @AuthenticationPrincipal User currentUser) {
        RequestItemResponse response = requestItemService.updateRequestItem(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Request item updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRequestItem(@PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        requestItemService.deleteRequestItem(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Request item deleted successfully", null));
    }

    @GetMapping("/collection/{collectionId}")
    public ResponseEntity<ApiResponse<List<RequestItemResponse>>> getRequestsByCollection(
            @PathVariable UUID collectionId,
            @AuthenticationPrincipal User currentUser) {
        List<RequestItemResponse> responses = requestItemService.getRequestsByCollection(collectionId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Requests fetched successfully", responses));
    }

    @GetMapping("/collection/{collectionId}/root")
    public ResponseEntity<ApiResponse<List<RequestItemResponse>>> getRootRequests(
            @PathVariable UUID collectionId,
            @AuthenticationPrincipal User currentUser) {
        List<RequestItemResponse> responses = requestItemService.getRootRequests(collectionId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Root requests fetched successfully", responses));
    }

    @GetMapping("/collection/{collectionId}/folders/{folderId}")
    public ResponseEntity<ApiResponse<List<RequestItemResponse>>> getRequestsByFolder(
            @PathVariable UUID collectionId,
            @PathVariable UUID folderId,
            @AuthenticationPrincipal User currentUser) {
        List<RequestItemResponse> responses = requestItemService.getRequestsByFolder(collectionId, folderId,
                currentUser);
        return ResponseEntity.ok(ApiResponse.success("Folder requests fetched successfully", responses));
    }
}
