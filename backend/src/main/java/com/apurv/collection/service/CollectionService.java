package com.apurv.collection.service;

import java.util.List;
import java.util.UUID;

import com.apurv.auth.entity.User;
import com.apurv.collection.dto.CollectionRequest;
import com.apurv.collection.dto.FolderRequest;
import com.apurv.collection.dto.FolderResponse;
import com.apurv.collection.dto.CollectionResponse;
import com.apurv.collection.entity.Collection;
import com.apurv.collection.entity.Folder;
import com.apurv.common.exception.DuplicateResourceException;
import com.apurv.common.exception.ResourceNotFoundException;
import com.apurv.collection.repository.CollectionRepository;
import com.apurv.collection.repository.FolderRepository;
import com.apurv.request.entity.RequestItem;
import com.apurv.request.repository.RequestItemRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final FolderRepository folderRepository;
    private final RequestItemRepository requestItemRepository;

    @Transactional
    public CollectionResponse createCollection(CollectionRequest request, User currentUser) {
        if (collectionRepository.existsByNameAndOwner(request.getName(), currentUser)) {
            throw new DuplicateResourceException("Collection with this name already exists");
        }

        Collection collection = Collection.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(currentUser)
                .build();

        Collection savedCollection = collectionRepository.save(collection);
        log.info("Created new collection with ID: {} for user: {}", savedCollection.getId(), currentUser.getUsername());
        return toCollectionResponse(savedCollection);
    }

    @Transactional(readOnly = true)
    public List<CollectionResponse> getAllCollections(User currentUser) {
        return collectionRepository.findByOwner(currentUser)
                .stream()
                .map(this::toCollectionResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CollectionResponse getCollectionById(UUID id, User currentUser) {
        Collection collection = findCollectionByIdAndOwner(id, currentUser);
        return toCollectionResponse(collection);
    }

    @Transactional
    public CollectionResponse updateCollection(UUID id, CollectionRequest request, User currentUser) {
        Collection collection = findCollectionByIdAndOwner(id, currentUser);

        if (!collection.getName().equals(request.getName())
                && collectionRepository.existsByNameAndOwner(request.getName(), currentUser)) {
            throw new DuplicateResourceException("Collection with this name already exists");
        }

        collection.setName(request.getName());
        collection.setDescription(request.getDescription());

        Collection updatedCollection = collectionRepository.save(collection);
        log.info("Updated collection with ID: {} for user: {}", updatedCollection.getId(), currentUser.getUsername());

        return toCollectionResponse(updatedCollection);
    }

    @Transactional
    public void deleteCollection(UUID id, User currentUser) {
        Collection collection = findCollectionByIdAndOwner(id, currentUser);

        List<RequestItem> requests = requestItemRepository.findByCollection(collection);
        requestItemRepository.deleteAll(requests);

        collectionRepository.delete(collection);

        log.info("Deleted collection with ID: {} for user: {}", collection.getId(), currentUser.getUsername());
    }

    @Transactional
    public FolderResponse createFolder(UUID collectionId, FolderRequest request, User currentUser) {
        Collection collection = findCollectionByIdAndOwner(collectionId, currentUser);

        Folder parent = null;
        if (request.getParentFolderId() != null) {
            parent = findFolderByIdAndCollection(request.getParentFolderId(), collection, "Parent folder not found");
        }

        Folder folder = Folder.builder()
                .name(request.getName())
                .collection(collection)
                .parentFolder(parent)
                .build();

        Folder savedFolder = folderRepository.save(folder);
        log.info("Created new folder with ID: {} in collection ID: {} for user: {}", savedFolder.getId(),
                collection.getId(), currentUser.getUsername());
        return toFolderResponse(savedFolder);
    }

    @Transactional(readOnly = true)
    public List<FolderResponse> getParentFolders(UUID collectionId, User currentUser) {
        Collection collection = findCollectionByIdAndOwner(collectionId, currentUser);

        return folderRepository.findByCollectionAndParentFolderIsNull(collection)
                .stream()
                .map(this::toFolderResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FolderResponse> getSubFolders(UUID collectionId, UUID folderId, User currentUser) {
        Collection collection = findCollectionByIdAndOwner(collectionId, currentUser);
        Folder folder = findFolderByIdAndCollection(folderId, collection, "Folder not found");

        return folderRepository.findByParentFolder(folder)
                .stream()
                .map(this::toFolderResponse)
                .toList();
    }

    @Transactional
    public void deleteFolder(UUID collectionId, UUID folderId, User currentUser) {
        Collection collection = findCollectionByIdAndOwner(collectionId, currentUser);
        Folder folder = findFolderByIdAndCollection(folderId, collection, "Folder not found");

        deleteRequestsInFolderRecursive(folder);

        folderRepository.delete(folder);
        log.info("Deleted folder with ID: {} in collection ID: {} for user: {}", folder.getId(),
                collection.getId(), currentUser.getUsername());
    }

    private void deleteRequestsInFolderRecursive(Folder folder) {
        List<RequestItem> requests = requestItemRepository.findByFolder(folder);
        requestItemRepository.deleteAll(requests);

        for (Folder subfolder : folder.getSubFolders()) {
            deleteRequestsInFolderRecursive(subfolder);
        }
    }

    @Transactional(readOnly = true)
    private Folder findFolderByIdAndCollection(UUID folderId, Collection collection, String errorMessage) {
        return folderRepository.findByIdAndCollection(folderId, collection)
                .orElseThrow(() -> new ResourceNotFoundException(errorMessage));
    }

    @Transactional(readOnly = true)
    private Collection findCollectionByIdAndOwner(UUID id, User currentUser) {
        return collectionRepository.findByIdAndOwner(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));
    }

    private CollectionResponse toCollectionResponse(Collection collection) {
        return CollectionResponse.builder()
                .id(collection.getId())
                .name(collection.getName())
                .description(collection.getDescription())
                .ownerId(collection.getOwner().getId())
                .ownerUsername(collection.getOwner().getUsername())
                .folderCount(collection.getFolders().size())
                .createdAt(collection.getCreatedAt())
                .updatedAt(collection.getUpdatedAt())
                .build();
    }

    private FolderResponse toFolderResponse(Folder savedFolder) {
        return FolderResponse.builder()
                .id(savedFolder.getId())
                .name(savedFolder.getName())
                .collectionId(savedFolder.getCollection().getId())
                .parentFolderId(savedFolder.getParentFolder() != null ? savedFolder.getParentFolder().getId() : null)
                .subFolderCount(savedFolder.getSubFolders().size())
                .createdAt(savedFolder.getCreatedAt())
                .build();
    }
}