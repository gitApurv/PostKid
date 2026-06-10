package com.apurv.environment.entity;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "environment_variables")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentVariable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String key;

    @Column(columnDefinition = "TEXT")
    private String value;

    @ManyToOne
    @JoinColumn(name = "environment_id", nullable = false, updatable = false)
    private Environment environment;
}
