package com.apurv.environment.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

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
        @CacheEvict(value = "environments", key = "#ownerId.toString()")
        public EnvironmentResponse createEnvironment(EnvironmentRequest request, UUID ownerId) {
                if (environmentRepository.existsByNameAndOwnerId(request.getName(), ownerId)) {
                        throw new DuplicateResourceException(
                                        "Environment with this name already exists");
                }

                Environment environment = Environment.builder()
                                .name(request.getName())
                                .environmentColor(request.getEnvironmentColor())
                                .ownerId(ownerId)
                                .build();

                Environment savedEnvironment = environmentRepository.saveAndFlush(environment);
                log.info("Created environment with id {} for owner {}", savedEnvironment.getId(), ownerId);
                return toEnvironmentResponse(savedEnvironment);
        }

        @Transactional(readOnly = true)
        @Cacheable(value = "environments", key = "#ownerId.toString()")
        public List<EnvironmentResponse> getAllEnvironments(UUID ownerId) {
                return environmentRepository.findByOwnerId(ownerId)
                                .stream()
                                .map(this::toEnvironmentResponse)
                                .toList();
        }

        @Transactional
        @CacheEvict(value = "environments", key = "#ownerId.toString()")
        public EnvironmentResponse updateEnvironment(UUID id, EnvironmentRequest request, UUID ownerId) {
                Environment environment = findEnvironmentByIdAndOwnerId(id, ownerId);

                if (!environment.getName().equals(request.getName())
                                && environmentRepository.existsByNameAndOwnerId(request.getName(), ownerId)) {
                        throw new DuplicateResourceException(
                                        "Environment with this name already exists");
                }

                environment.setName(request.getName());
                environment.setEnvironmentColor(request.getEnvironmentColor());

                Environment updatedEnvironment = environmentRepository.saveAndFlush(environment);
                log.info("Updated environment with id {} for owner {}", updatedEnvironment.getId(), ownerId);

                return toEnvironmentResponse(updatedEnvironment);
        }

        @Transactional
        @CacheEvict(value = "environments", key = "#ownerId.toString()")
        public void deleteEnvironment(UUID id, UUID ownerId) {
                Environment environment = findEnvironmentByIdAndOwnerId(id, ownerId);

                environmentRepository.delete(environment);

                log.info("Deleted environment with id {} for owner {}", id, ownerId);
        }

        @Transactional
        @CacheEvict(value = "environments", key = "#ownerId.toString()")
        public VariableResponse addVariable(UUID environmentId, VariableRequest request, UUID ownerId) {
                Environment environment = findEnvironmentByIdAndOwnerId(environmentId, ownerId);

                if (environmentVariableRepository.existsByKeyAndEnvironmentId(request.getKey(), environment.getId())) {
                        throw new DuplicateResourceException(
                                        "Variable with this key already exists in the environment");
                }

                EnvironmentVariable variable = EnvironmentVariable.builder()
                                .key(request.getKey())
                                .value(request.getValue())
                                .environment(environment)
                                .build();

                EnvironmentVariable savedVariable = environmentVariableRepository.saveAndFlush(variable);
                log.info("Added variable with id {} to environment {} for owner {}", savedVariable.getId(),
                                environmentId,
                                ownerId);

                return toVariableResponse(savedVariable);
        }

        @Transactional
        @CacheEvict(value = "environments", key = "#ownerId.toString()")
        public VariableResponse updateVariable(UUID environmentId, UUID variableId, VariableRequest request,
                        UUID ownerId) {
                Environment environment = findEnvironmentByIdAndOwnerId(environmentId, ownerId);

                EnvironmentVariable variable = environmentVariableRepository
                                .findByIdAndEnvironmentId(variableId, environment.getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Variable not found"));

                variable.setKey(request.getKey());
                variable.setValue(request.getValue());

                EnvironmentVariable updatedVariable = environmentVariableRepository.saveAndFlush(variable);
                log.info("Updated variable with id {} in environment {} for owner {}", updatedVariable.getId(),
                                environmentId,
                                ownerId);

                return toVariableResponse(updatedVariable);
        }

        @Transactional
        @CacheEvict(value = "environments", key = "#ownerId.toString()")
        public void deleteVariable(UUID environmentId, UUID variableId, UUID ownerId) {
                Environment environment = findEnvironmentByIdAndOwnerId(environmentId, ownerId);

                EnvironmentVariable variable = environmentVariableRepository.findByIdAndEnvironmentId(variableId,
                                environment.getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Variable not found"));

                environmentVariableRepository.delete(variable);
                log.info("Deleted variable with id {} from environment {} for owner {}", variableId, environmentId,
                                ownerId);
        }

        @Transactional(readOnly = true)
        private Environment findEnvironmentByIdAndOwnerId(UUID id, UUID ownerId) {
                return environmentRepository.findByIdAndOwnerId(id, ownerId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Environment not found"));
        }

        private EnvironmentResponse toEnvironmentResponse(Environment environment) {
                return EnvironmentResponse.builder()
                                .id(environment.getId())
                                .name(environment.getName())
                                .environmentColor(environment.getEnvironmentColor())
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
                                .value(variable.getValue())
                                .build();
        }
}
