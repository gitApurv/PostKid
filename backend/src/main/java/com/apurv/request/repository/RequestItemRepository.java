package com.apurv.request.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.apurv.collection.entity.Collection;
import com.apurv.collection.entity.Folder;
import com.apurv.request.entity.RequestItem;

@Repository
public interface RequestItemRepository extends JpaRepository<RequestItem, UUID> {

    List<RequestItem> findByCollection(Collection collection);

    List<RequestItem> findByFolder(Folder folder);

    Optional<RequestItem> findByIdAndCollection(UUID id, Collection collection);

    Optional<RequestItem> findByIdAndFolder(UUID id, Folder folder);
}
