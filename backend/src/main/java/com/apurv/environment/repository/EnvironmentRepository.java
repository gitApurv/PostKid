package com.apurv.environment.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.apurv.environment.entity.Environment;

@Repository
public interface EnvironmentRepository extends JpaRepository<Environment, UUID> {

    List<Environment> findByOwnerId(UUID ownerId);

    Optional<Environment> findByIdAndOwnerId(UUID id, UUID ownerId);

    boolean existsByNameAndOwnerId(String name, UUID ownerId);
}
