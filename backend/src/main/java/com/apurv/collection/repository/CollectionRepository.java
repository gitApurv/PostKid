package com.apurv.collection.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.apurv.auth.entity.User;
import com.apurv.collection.entity.Collection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CollectionRepository extends JpaRepository<Collection, UUID> {

    List<Collection> findByOwner(User owner);

    Optional<Collection> findByIdAndOwner(UUID id, User owner);

    boolean existsByNameAndOwner(String name, User owner);

}