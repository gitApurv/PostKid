package com.apurv.workspace.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apurv.auth.entity.Role;
import com.apurv.auth.entity.User;
import com.apurv.auth.repository.UserRepository;
import com.apurv.common.exception.DuplicateResourceException;
import com.apurv.common.exception.ResourceNotFoundException;
import com.apurv.workspace.dto.InviteMemberRequest;
import com.apurv.workspace.dto.MemberResponse;
import com.apurv.workspace.dto.WorkspaceRequest;
import com.apurv.workspace.dto.WorkspaceResponse;
import com.apurv.workspace.entity.Workspace;
import com.apurv.workspace.entity.WorkspaceMember;
import com.apurv.workspace.repository.WorkspaceMemberRepository;
import com.apurv.workspace.repository.WorkspaceRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final WorkspaceAuthorizationService workspaceAuthorizationService;

    public WorkspaceResponse createWorkspace(WorkspaceRequest request, User currentUser) {
        Workspace workspace = new Workspace();
        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());
        workspace.setOwner(currentUser);

        Workspace savedWorkspace = workspaceRepository.save(workspace);

        WorkspaceMember workspaceMember = new WorkspaceMember();
        workspaceMember.setWorkspace(savedWorkspace);
        workspaceMember.setUser(currentUser);
        workspaceMember.setRole(Role.OWNER);
        workspaceMemberRepository.save(workspaceMember);

        return toWorkspaceResponse(savedWorkspace, 1);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceResponse> getAllWorkspaces(User currentUser) {
        List<Workspace> workspaces = workspaceRepository.findAllByMembersId(currentUser.getId());

        return workspaces.stream().map(workspace -> {
            int memberCount = workspaceMemberRepository.findAllByWorkspaceId(workspace.getId()).size();
            return toWorkspaceResponse(workspace, memberCount);
        }).toList();
    }

    @Transactional(readOnly = true)
    public WorkspaceResponse getWorkspaceById(UUID id, User currentUser) {
        Workspace workspace = getWorkspace(id);

        workspaceAuthorizationService.requireRole(id, currentUser.getId(), Role.OWNER, Role.ADMIN, Role.MEMBER,
                Role.VIEWER);

        int memberCount = workspaceMemberRepository.findAllByWorkspaceId(workspace.getId()).size();

        return toWorkspaceResponse(workspace, memberCount);
    }

    public WorkspaceResponse updateWorkspace(UUID id, WorkspaceRequest request, User currentUser) {
        Workspace workspace = getWorkspace(id);

        workspaceAuthorizationService.requireRole(id, currentUser.getId(), Role.OWNER, Role.ADMIN);

        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());

        Workspace updatedWorkspace = workspaceRepository.save(workspace);

        int memberCount = workspaceMemberRepository.findAllByWorkspaceId(updatedWorkspace.getId()).size();

        return toWorkspaceResponse(updatedWorkspace, memberCount);
    }

    public void deleteWorkspace(UUID id, User currentUser) {

        Workspace workspace = getWorkspace(id);

        workspaceAuthorizationService.requireRole(id, currentUser.getId(), Role.OWNER);

        workspaceRepository.delete(workspace);

        log.info("Workspace with id {} deleted by user {}", id, currentUser.getId());
    }

    public MemberResponse inviteMember(UUID workspaceId, InviteMemberRequest request, User currentUser) {
        Workspace workspace = getWorkspace(workspaceId);

        workspaceAuthorizationService.requireRole(workspaceId, currentUser.getId(), Role.OWNER, Role.ADMIN);

        if (request.getRole() == Role.OWNER) {
            throw new IllegalArgumentException("Cannot invite a member with OWNER role");
        }

        User invitedUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, invitedUser.getId())) {
            throw new DuplicateResourceException("User is already a member of the workspace");
        }

        WorkspaceMember workspaceMember = new WorkspaceMember();
        workspaceMember.setWorkspace(workspace);
        workspaceMember.setUser(invitedUser);
        workspaceMember.setRole(request.getRole());
        workspaceMember.setInvitedBy(currentUser);

        WorkspaceMember savedWorkspaceMember = workspaceMemberRepository.save(workspaceMember);

        return toMemberResponse(savedWorkspaceMember);
    }

    public void removeMember(UUID workspaceId, UUID userId, User currentUser) {
        Workspace _ = getWorkspace(workspaceId);

        workspaceAuthorizationService.requireRole(workspaceId, currentUser.getId(), Role.OWNER, Role.ADMIN);

        WorkspaceMember workspaceMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in the workspace"));

        if (workspaceMember.getRole() == Role.OWNER) {
            throw new IllegalArgumentException("Cannot remove the owner from the workspace");
        }

        workspaceMemberRepository.delete(workspaceMember);

        log.info("User with id {} removed from workspace {} by user {}", userId, workspaceId, currentUser.getId());
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> getMembers(UUID workspaceId, User currentUser) {
        Workspace _ = getWorkspace(workspaceId);

        workspaceAuthorizationService.requireRole(workspaceId, currentUser.getId(), Role.OWNER, Role.ADMIN, Role.MEMBER,
                Role.VIEWER);

        List<WorkspaceMember> workspaceMembers = workspaceMemberRepository.findAllByWorkspaceId(workspaceId);

        return workspaceMembers.stream()
                .map(this::toMemberResponse)
                .collect(Collectors.toList());
    }

    private WorkspaceResponse toWorkspaceResponse(Workspace workspace, int memberCount) {
        return WorkspaceResponse.builder()
                .id(workspace.getId())
                .name(workspace.getName())
                .description(workspace.getDescription())
                .ownerId(workspace.getOwner().getId())
                .ownerUsername(workspace.getOwner().getUsername())
                .memberCount(memberCount)
                .createdAt(workspace.getCreatedAt())
                .updatedAt(workspace.getUpdatedAt())
                .build();
    }

    private MemberResponse toMemberResponse(WorkspaceMember workspaceMember) {
        return MemberResponse.builder()
                .userId(workspaceMember.getUser().getId())
                .username(workspaceMember.getUser().getUsername())
                .email(workspaceMember.getUser().getEmail())
                .role(workspaceMember.getRole())
                .joinedAt(workspaceMember.getJoinedAt())
                .build();
    }

    private Workspace getWorkspace(UUID id) {
        return workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));
    }

}
