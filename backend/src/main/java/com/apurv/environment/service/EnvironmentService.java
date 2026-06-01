package com.apurv.environment.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apurv.common.exception.DuplicateResourceException;
import com.apurv.common.exception.ResourceNotFoundException;
import com.apurv.environment.dto.EnvironmentRequest;
import com.apurv.environment.dto.EnvironmentResponse;
import com.apurv.environment.dto.VariableRequest;
import com.apurv.environment.dto.VariableResponse;
import com.apurv.environment.entity.Environment;
import com.apurv.environment.entity.EnvironmentVariable;
import com.apurv.environment.repository.EnvironmentRepository;
import com.apurv.environment.repository.EnvironmentVariableRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnvironmentService {

    private final EnvironmentRepository environmentRepository;
    private final EnvironmentVariableRepository environmentVariableRepository;

    @Transactional
    public EnvironmentResponse createEnvironment(EnvironmentRequest request, UUID ownerId) {
        if (environmentRepository.existsByNameAndOwnerId(request.getName(), ownerId)) {
            throw new DuplicateResourceException(
                    "Environment with name " + request.getName() + " already exists for owner " + ownerId);
        }

        Environment environment = Environment.builder()
                .name(request.getName())
                .ownerId(ownerId)
                .build();

        Environment savedEnvironment = environmentRepository.save(environment);
        log.info("Created environment with id {} for owner {}", savedEnvironment.getId(), ownerId);
        return toEnvironmentResponse(savedEnvironment);
    }

    @Transactional(readOnly = true)
    public List<EnvironmentResponse> getAllEnvironments(UUID ownerId) {
        return environmentRepository.findByOwnerId(ownerId)
                .stream()
                .map(this::toEnvironmentResponse)
                .toList();
    }

    @Transactional
    public EnvironmentResponse updateEnvironment(UUID id, EnvironmentRequest request, UUID ownerId) {
        Environment environment = findEnvironmentByIdAndOwnerid(id, ownerId);

        if (!environment.getName().equals(request.getName())
                && environmentRepository.existsByNameAndOwnerId(request.getName(), ownerId)) {
            throw new DuplicateResourceException(
                    "Environment with name " + request.getName() + " already exists for owner " + ownerId);
        }

        environment.setName(request.getName());

        Environment updatedEnvironment = environmentRepository.save(environment);
        log.info("Updated environment with id {} for owner {}", updatedEnvironment.getId(), ownerId);

        return toEnvironmentResponse(updatedEnvironment);
    }

    @Transactional
    public void deleteEnvironment(UUID id, UUID ownerId) {
        Environment environment = findEnvironmentByIdAndOwnerid(id, ownerId);

        environmentRepository.delete(environment);

        log.info("Deleted environment with id {} for owner {}", id, ownerId);
    }

    @Transactional
    public VariableResponse addVariable(UUID environmentId, VariableRequest request, UUID ownerId) {
        Environment environment = findEnvironmentByIdAndOwnerid(environmentId, ownerId);

        if (environmentVariableRepository.existsByKeyAndEnvironmentId(request.getKey(), environment.getId())) {
            throw new DuplicateResourceException(
                    "Variable with key " + request.getKey() + " already exists in environment " + environmentId);
        }

        EnvironmentVariable variable = EnvironmentVariable.builder()
                .key(request.getKey())
                .value(request.getValue())
                .secret(request.isSecret())
                .environment(environment)
                .build();

        EnvironmentVariable savedVariable = environmentVariableRepository.save(variable);
        log.info("Added variable with id {} to environment {} for owner {}", savedVariable.getId(), environmentId,
                ownerId);

        return toVariableResponse(savedVariable);
    }

    @Transactional
    public void deleteVariable(UUID environmentId, UUID variableId, UUID ownerId) {
        Environment environment = findEnvironmentByIdAndOwnerid(environmentId, ownerId);

        EnvironmentVariable variable = environmentVariableRepository.findByIdAndEnvironmentId(variableId,
                environment.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Variable with id " + variableId + " not found in environment " + environmentId));

        environmentVariableRepository.delete(variable);
        log.info("Deleted variable with id {} from environment {} for owner {}", variableId, environmentId, ownerId);
    }

    @Transactional(readOnly = true)
    private Environment findEnvironmentByIdAndOwnerid(UUID id, UUID ownerId) {
        return environmentRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Environment with id " + id + " not found for owner " + ownerId));
    }

    private EnvironmentResponse toEnvironmentResponse(Environment environment) {
        return EnvironmentResponse.builder()
                .id(environment.getId())
                .name(environment.getName())
                .ownerId(environment.getOwnerId())
                .variables(environment.getVariables()
                        .stream()
                        .map(this::toVariableResponse)
                        .toList())
                .createdAt(environment.getCreatedAt())
                .updatedAt(environment.getUpdatedAt())
                .build();
    }

    private VariableResponse toVariableResponse(EnvironmentVariable variable) {
        return VariableResponse.builder()
                .id(variable.getId())
                .key(variable.getKey())
                .value(variable.isSecret() ? "******" : variable.getValue())
                .secret(variable.isSecret())
                .build();
    }
}
