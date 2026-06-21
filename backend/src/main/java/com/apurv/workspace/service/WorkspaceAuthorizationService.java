package com.apurv.workspace.service;

import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.apurv.workspace.entity.WorkspaceRole;
import com.apurv.common.exception.ResourceNotFoundException;
import com.apurv.workspace.entity.WorkspaceMember;
import com.apurv.workspace.repository.WorkspaceMemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkspaceAuthorizationService {

    private final WorkspaceMemberRepository workspaceMemberRepository;

    public WorkspaceRole getMemberRole(UUID workspaceId, UUID userId) {
        WorkspaceMember workspaceMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("User is not a member of this workspace"));
        return workspaceMember.getRole();
    }

    public boolean isMember(UUID workspaceId, UUID userId) {
        return workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId);
    }

    public void requireRole(UUID workspaceId, UUID userId, WorkspaceRole... allowedRoles) {
        WorkspaceRole memberRole = getMemberRole(workspaceId, userId);
        if (!java.util.Arrays.asList(allowedRoles).contains(memberRole)) {
            throw new AccessDeniedException("Insufficient permissions for this workspace operation");
        }
    }
}
