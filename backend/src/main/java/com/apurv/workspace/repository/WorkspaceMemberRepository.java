package com.apurv.workspace.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.apurv.workspace.entity.WorkspaceMember;

@Repository
public interface WorkspaceMemberRepository
        extends JpaRepository<WorkspaceMember, UUID> {

    public Optional<WorkspaceMember> findByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);

    public List<WorkspaceMember> findAllByWorkspaceId(UUID workspaceId);

    public boolean existsByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);

    void deleteByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);

    void deleteByWorkspaceId(UUID workspaceId);

}
