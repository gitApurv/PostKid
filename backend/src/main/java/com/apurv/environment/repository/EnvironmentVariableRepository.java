package com.apurv.environment.repository;

import java.util.UUID;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.apurv.environment.entity.EnvironmentVariable;

@Repository
public interface EnvironmentVariableRepository extends JpaRepository<EnvironmentVariable, UUID> {

    List<EnvironmentVariable> findByEnvironmentId(UUID environmentId);

    boolean existsByKeyAndEnvironmentId(String key, UUID environmentId);

    Optional<EnvironmentVariable> findByIdAndEnvironmentId(UUID id, UUID environmentId);
}
