package com.apurv.request.entity;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import com.apurv.auth.entity.User;
import com.apurv.collection.entity.Collection;
import com.apurv.collection.entity.Folder;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "request_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collection_id")
    private Collection collection;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    private Folder folder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "method", nullable = false)
    private HttpMethod method;

    @Column(name = "url", nullable = false)
    private String url;

    @ElementCollection
    @CollectionTable(name = "request_params", joinColumns = @JoinColumn(name = "request_id"))
    @MapKeyColumn(name = "param_name")
    @Column(name = "param_value")
    @Builder.Default
    private Map<String, String> params = new HashMap<>();

    @ElementCollection
    @CollectionTable(name = "request_headers", joinColumns = @JoinColumn(name = "request_id"))
    @MapKeyColumn(name = "header_name")
    @Column(name = "header_value")
    @Builder.Default
    private Map<String, String> headers = new HashMap<>();

    @Column(name = "body", columnDefinition = "TEXT")
    private String body;

    @Column(name = "auth_type")
    private String authType;

    @ElementCollection
    @CollectionTable(name = "request_auth_values", joinColumns = @JoinColumn(name = "request_id"))
    @MapKeyColumn(name = "auth_key")
    @Column(name = "auth_value")
    @Builder.Default
    private Map<String, String> authValue = new HashMap<>();

    @Column(name = "timeout_ms")
    @Builder.Default
    private Integer timeoutMs = 5000;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void prePersist() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void preUpdate() {
        updatedAt = Instant.now();
    }
}
