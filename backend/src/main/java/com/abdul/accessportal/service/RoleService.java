package com.abdul.accessportal.service;

import com.abdul.accessportal.dto.CreateRoleRequest;
import com.abdul.accessportal.dto.RoleResponse;
import com.abdul.accessportal.dto.UpdateRoleRequest;
import com.abdul.accessportal.entity.Permission;
import com.abdul.accessportal.entity.Role;
import com.abdul.accessportal.repository.PermissionRepository;
import com.abdul.accessportal.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final AuditService auditService;

    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public RoleResponse getRoleById(Long id) {
        return toResponse(findRole(id));
    }

    @Transactional
    public RoleResponse createRole(CreateRoleRequest request, String actorEmail) {
        String roleName = request.getName().trim().toUpperCase();

        if (roleRepository.existsByName(roleName)) {
            throw new IllegalArgumentException("Role already exists");
        }

        Role role = new Role();
        role.setName(roleName);
        role.setDescription(request.getDescription());
        role.setPermissions(loadPermissions(request.getPermissionIds()));

        Role savedRole = roleRepository.save(role);

        auditService.log(
                actorEmail,
                "ROLE_CREATED",
                "Created role: " + savedRole.getName(),
                null
        );

        auditService.log(
                actorEmail,
                "ROLE_PERMISSION_UPDATED",
                "Assigned " + savedRole.getPermissions().size() + " permissions to role: " + savedRole.getName(),
                null
        );

        return toResponse(savedRole);
    }

    @Transactional
    public RoleResponse updateRole(Long id, UpdateRoleRequest request, String actorEmail) {
        Role role = findRole(id);
        String roleName = request.getName().trim().toUpperCase();

        roleRepository.findByName(roleName).ifPresent(existingRole -> {
            if (!existingRole.getId().equals(id)) {
                throw new IllegalArgumentException("Role already exists");
            }
        });

        Set<String> previousPermissions = role.getPermissions()
                .stream()
                .map(Permission::getName)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        role.setName(roleName);
        role.setDescription(request.getDescription());
        role.setPermissions(loadPermissions(request.getPermissionIds()));

        Role savedRole = roleRepository.save(role);

        Set<String> updatedPermissions = savedRole.getPermissions()
                .stream()
                .map(Permission::getName)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        auditService.log(
                actorEmail,
                "ROLE_UPDATED",
                "Updated role: " + savedRole.getName(),
                null
        );

        if (!previousPermissions.equals(updatedPermissions)) {
            auditService.log(
                    actorEmail,
                    "ROLE_PERMISSION_UPDATED",
                    "Updated permissions for role: " + savedRole.getName(),
                    null
            );
        }

        return toResponse(savedRole);
    }

    private Role findRole(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found"));
    }

    private Set<Permission> loadPermissions(Set<Long> permissionIds) {
        if (permissionIds == null || permissionIds.isEmpty()) {
            return new LinkedHashSet<>();
        }

        return new LinkedHashSet<>(permissionRepository.findAllById(permissionIds));
    }

    private RoleResponse toResponse(Role role) {
        Set<String> permissions = role.getPermissions()
                .stream()
                .map(Permission::getName)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return new RoleResponse(
                role.getId(),
                role.getName(),
                role.getDescription(),
                permissions
        );
    }
}
