package com.apurv.environment.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.apurv.collection.entity.Collection;
import com.apurv.environment.entity.Environment;

@Repository
public interface EnvironmentRepository extends JpaRepository<Environment, UUID> {

    List<Environment> findByCollection(Collection collection);

    Optional<Environment> findByIdAndCollection(UUID id, Collection collection);

    boolean existsByNameAndCollection(String name, Collection collection);

}
