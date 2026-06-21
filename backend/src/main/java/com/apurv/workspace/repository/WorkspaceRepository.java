package com.apurv.workspace.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.apurv.workspace.entity.Workspace;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {

    public List<Workspace> findByOwnerId(UUID ownerId);

    @Query("SELECT workspace FROM Workspace workspace JOIN WorkspaceMember workspaceMember ON workspaceMember.workspace = workspace WHERE workspaceMember.user.id = :userId")
    public List<Workspace> findAllByMembersId(@Param("userId") UUID memberId);

}
