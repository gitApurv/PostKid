package com.apurv.request.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apurv.auth.entity.User;
import com.apurv.collection.entity.Collection;
import com.apurv.collection.entity.Folder;
import com.apurv.collection.repository.CollectionRepository;
import com.apurv.collection.repository.FolderRepository;
import com.apurv.common.exception.ResourceNotFoundException;
import com.apurv.request.dto.RequestItemRequest;
import com.apurv.request.dto.RequestItemResponse;
import com.apurv.request.entity.RequestItem;
import com.apurv.request.repository.RequestItemRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RequestItemService {

    private final RequestItemRepository requestItemRepository;
    private final CollectionRepository collectionRepository;
    private final FolderRepository folderRepository;

    @Transactional
    public RequestItemResponse createRequestItem(RequestItemRequest request, User currentUser) {
        Collection collection = findCollectionByIdAndOwner(request.getCollectionId(), currentUser);
        Folder folder = null;

        if (request.getFolderId() != null) {
            folder = findFolderByIdAndCollection(request.getFolderId(), collection);
        }

        RequestItem requestItem = RequestItem.builder()
                .name(request.getName())
                .method(request.getMethod())
                .url(request.getUrl())
                .body(request.getBody())
                .headers(request.getHeaders())
                .authType(request.getAuthType())
                .authValue(request.getAuthValue())
                .timeoutMs(request.getTimeoutMs() != null ? request.getTimeoutMs() : 5000)
                .collection(collection)
                .folder(folder)
                .owner(currentUser)
                .build();

        RequestItem savedRequestItem = requestItemRepository.saveAndFlush(requestItem);

        log.info("Created request item with ID: {} in collection ID: {} for user: {}", savedRequestItem.getId(),
                collection.getId(), currentUser.getUsername());

        return toRequestItemResponse(savedRequestItem);
    }

    @Transactional(readOnly = true)
    public List<RequestItemResponse> getRequestsByCollection(UUID collectionId, User currentUser) {
        Collection collection = findCollectionByIdAndOwner(collectionId, currentUser);

        return requestItemRepository.findByCollection(collection)
                .stream()
                .map(this::toRequestItemResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RequestItemResponse> getRootRequests(UUID collectionId, User currentUser) {
        Collection collection = findCollectionByIdAndOwner(collectionId, currentUser);

        return requestItemRepository.findByCollectionAndFolderIsNull(collection)
                .stream()
                .map(this::toRequestItemResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RequestItemResponse> getRequestsByFolder(UUID collectionId, UUID folderId, User currentUser) {
        Collection collection = findCollectionByIdAndOwner(collectionId, currentUser);
        Folder folder = findFolderByIdAndCollection(folderId, collection);

        return requestItemRepository.findByFolder(folder)
                .stream()
                .map(this::toRequestItemResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RequestItemResponse getRequestById(UUID id, User currentUser) {
        RequestItem requestItem = findRequestItemByIdAndOwner(id, currentUser);
        return toRequestItemResponse(requestItem);
    }

    @Transactional
    public RequestItemResponse updateRequestItem(UUID id, RequestItemRequest request, User currentUser) {
        RequestItem requestItem = findRequestItemByIdAndOwner(id, currentUser);
        Collection collection = findCollectionByIdAndOwner(request.getCollectionId(), currentUser);
        Folder folder = null;

        if (request.getFolderId() != null) {
            folder = findFolderByIdAndCollection(request.getFolderId(), collection);
        }

        requestItem.setName(request.getName());
        requestItem.setMethod(request.getMethod());
        requestItem.setUrl(request.getUrl());
        requestItem.setHeaders(request.getHeaders());
        requestItem.setBody(request.getBody());
        requestItem.setAuthType(request.getAuthType());
        requestItem.setAuthValue(request.getAuthValue());
        requestItem.setTimeoutMs(request.getTimeoutMs() != null ? request.getTimeoutMs() : 5000);
        requestItem.setCollection(collection);
        requestItem.setFolder(folder);

        RequestItem updatedRequestItem = requestItemRepository.saveAndFlush(requestItem);
        log.info("Updated request item with ID: {} for user: {}", updatedRequestItem.getId(),
                currentUser.getUsername());

        return toRequestItemResponse(updatedRequestItem);
    }

    @Transactional
    public void deleteRequestItem(UUID id, User currentUser) {
        RequestItem requestItem = findRequestItemByIdAndOwner(id, currentUser);
        requestItemRepository.delete(requestItem);
        log.info("Deleted request item with ID: {} for user: {}", requestItem.getId(), currentUser.getUsername());
    }

    @Transactional(readOnly = true)
    private Collection findCollectionByIdAndOwner(UUID collectionId, User currentUser) {
        return collectionRepository.findByIdAndOwner(collectionId, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));
    }

    @Transactional(readOnly = true)
    private Folder findFolderByIdAndCollection(UUID folderId, Collection collection) {
        return folderRepository.findByIdAndCollection(folderId, collection)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
    }

    @Transactional(readOnly = true)
    private RequestItem findRequestItemByIdAndOwner(UUID id, User currentUser) {
        return requestItemRepository.findByIdAndOwner(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Request item not found"));
    }

    private RequestItemResponse toRequestItemResponse(RequestItem requestItem) {
        return RequestItemResponse.builder()
                .id(requestItem.getId())
                .name(requestItem.getName())
                .method(requestItem.getMethod())
                .url(requestItem.getUrl())
                .headers(requestItem.getHeaders())
                .body(requestItem.getBody())
                .authType(requestItem.getAuthType())
                .authValue(requestItem.getAuthValue())
                .timeoutMs(requestItem.getTimeoutMs() != null ? requestItem.getTimeoutMs() : 5000)
                .collectionId(requestItem.getCollection().getId())
                .folderId(requestItem.getFolder() != null ? requestItem.getFolder().getId() : null)
                .ownerId(requestItem.getOwner().getId())
                .createdAt(requestItem.getCreatedAt())
                .updatedAt(requestItem.getUpdatedAt())
                .build();
    }
}
