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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apurv.auth.entity.User;
import com.apurv.common.dto.ApiResponse;
import com.apurv.request.dto.ExecutionRequest;
import com.apurv.request.dto.ExecutionResponse;
import com.apurv.request.dto.RequestItemRequest;
import com.apurv.request.dto.RequestItemResponse;
import com.apurv.request.service.CollectionRequestItemService;
import com.apurv.request.service.RequestExecutionService;

import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/collections/{collectionId}/requests")
@RequiredArgsConstructor
public class CollectionRequestItemController {

        private final CollectionRequestItemService collectionRequestItemService;
        private final RequestExecutionService requestExecutionService;

        @PostMapping("/execute")
        public ResponseEntity<ApiResponse<ExecutionResponse>> executeRequest(
                        @PathVariable UUID workspaceId,
                        @PathVariable UUID collectionId,
                        @Valid @RequestBody ExecutionRequest request,
                        @AuthenticationPrincipal User currentUser) {

                ExecutionResponse response = requestExecutionService.executeRequest(workspaceId, request,
                                currentUser);
                return ResponseEntity.ok(ApiResponse.success("Request executed successfully", response));
        }

        @PostMapping
        public ResponseEntity<ApiResponse<RequestItemResponse>> createRequestItem(
                        @PathVariable UUID workspaceId,
                        @PathVariable UUID collectionId,
                        @Valid @RequestBody RequestItemRequest request,
                        @AuthenticationPrincipal User currentUser) {

                RequestItemResponse response = collectionRequestItemService.createRequestItem(workspaceId, collectionId,
                                request, currentUser);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success("Request item created successfully", response));
        }

        @GetMapping
        public ResponseEntity<ApiResponse<List<RequestItemResponse>>> getRequestById(
                        @PathVariable UUID workspaceId,
                        @PathVariable UUID collectionId,
                        @AuthenticationPrincipal User currentUser) {

                List<RequestItemResponse> responses = collectionRequestItemService.getRequestsByCollection(workspaceId,
                                collectionId,
                                currentUser);
                return ResponseEntity.ok(ApiResponse.success("Request items fetched successfully", responses));
        }

        @PutMapping("/{requestId}")
        public ResponseEntity<ApiResponse<RequestItemResponse>> updateRequestItem(
                        @PathVariable UUID workspaceId,
                        @PathVariable UUID collectionId,
                        @PathVariable UUID requestId,
                        @Valid @RequestBody RequestItemRequest request,
                        @AuthenticationPrincipal User currentUser) {

                RequestItemResponse response = collectionRequestItemService.updateRequestItem(workspaceId, collectionId,
                                requestId, request, currentUser);
                return ResponseEntity.ok(ApiResponse.success("Request item updated successfully", response));
        }

        @DeleteMapping("/{requestId}")
        public ResponseEntity<ApiResponse<Void>> deleteRequestItem(
                        @PathVariable UUID workspaceId,
                        @PathVariable UUID collectionId,
                        @PathVariable UUID requestId,
                        @AuthenticationPrincipal User currentUser) {

                collectionRequestItemService.deleteRequestItem(workspaceId, collectionId, requestId, currentUser);
                return ResponseEntity.ok(ApiResponse.success("Request item deleted successfully", null));
        }

}
