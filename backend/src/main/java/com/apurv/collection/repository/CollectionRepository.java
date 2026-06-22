package com.apurv.collection.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.apurv.collection.entity.Collection;
import com.apurv.workspace.entity.Workspace;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CollectionRepository extends JpaRepository<Collection, UUID> {

    List<Collection> findByWorkspace(Workspace workspace);

    Optional<Collection> findByIdAndWorkspace(UUID collectionId, Workspace workspace);

    boolean existsByNameAndWorkspace(String name, Workspace workspace);

}