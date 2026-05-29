package com.apurv.history.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.apurv.history.document.RequestHistory;

@Repository
public interface RequestHistoryRepository extends MongoRepository<RequestHistory, String> {

    Page<RequestHistory> findByUserIdOrderByExecutedAtDesc(UUID userId, Pageable page);

    List<RequestHistory> findByRequestItemId(UUID requestItemId);

    void deleteByUserId(UUID userId);

    void deleteByRequestItemId(UUID requestItemId);
}
