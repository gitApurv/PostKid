package com.apurv.common.exception;

import java.util.stream.Collectors;

import com.apurv.common.dto.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import lombok.extern.slf4j.Slf4j;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<?>> handleMethodArgumentNotValidException(
                        MethodArgumentNotValidException exception) {
                String message = exception.getBindingResult().getFieldErrors().stream()
                                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                                .collect(Collectors.joining(", "));

                log.warn("Validation failed: {}", message);

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error(message));
        }

        @ExceptionHandler(ConstraintViolationException.class)
        public ResponseEntity<ApiResponse<?>> handleConstraintViolationException(
                        ConstraintViolationException exception) {
                String message = exception.getConstraintViolations().stream()
                                .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                                .collect(Collectors.joining(", "));

                log.warn("Constraint violation: {}", message);

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error(message));
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiResponse<?>> handleIllegalArgumentException(
                        IllegalArgumentException exception) {
                log.warn("Illegal argument: {}", exception.getMessage());

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error(exception.getMessage()));
        }

        @ExceptionHandler(DuplicateResourceException.class)
        public ResponseEntity<ApiResponse<?>> handleDuplicateResourceException(DuplicateResourceException ex) {
                log.warn("Duplicate resource: {}", ex.getMessage());

                return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(ApiResponse.error(ex.getMessage()));
        }

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiResponse<?>> handleResourceNotFoundException(ResourceNotFoundException ex) {
                log.warn("Resource not found: {}", ex.getMessage());

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(ApiResponse.error(ex.getMessage()));
        }

        @ExceptionHandler(TokenRefreshException.class)
        public ResponseEntity<ApiResponse<?>> handleTokenRefreshException(TokenRefreshException ex) {
                log.warn("Token refresh failed: {}", ex.getMessage());

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(ApiResponse.error(ex.getMessage()));
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<?>> handleGenericException(Exception exception) {
                log.error("Unhandled exception occurred", exception);

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ApiResponse.error("An unexpected error occurred"));
        }
}
