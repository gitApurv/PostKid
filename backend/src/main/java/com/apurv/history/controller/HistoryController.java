package com.apurv.history.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.apurv.auth.entity.User;
import com.apurv.common.dto.ApiResponse;
import com.apurv.history.dto.HistoryResponse;
import com.apurv.history.service.HistoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/history")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService historyService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<HistoryResponse>>> getUserHistory(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser) {
        Page<HistoryResponse> response = historyService.getUserHistory(currentUser, page, size);
        return ResponseEntity.ok(ApiResponse.success("User history fetched successfully", response));
    }

    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<HistoryResponse>> getHistoryById(@PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        HistoryResponse response = historyService.getHistory(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("History fetched successfully", response));
    }

    @DeleteMapping("{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHistoryEntry(@PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        historyService.deleteHistoryEntry(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("History entry deleted successfully", null));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearUserHistory(@AuthenticationPrincipal User currentUser) {
        historyService.clearUserHistory(currentUser);
        return ResponseEntity.ok(ApiResponse.success("User history cleared successfully", null));
    }

}
