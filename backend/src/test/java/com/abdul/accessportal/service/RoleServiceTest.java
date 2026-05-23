package com.abdul.accessportal.service;

import com.abdul.accessportal.dto.CreateRoleRequest;
import com.abdul.accessportal.dto.RoleResponse;
import com.abdul.accessportal.dto.UpdateRoleRequest;
import com.abdul.accessportal.entity.Permission;
import com.abdul.accessportal.entity.Role;
import com.abdul.accessportal.repository.PermissionRepository;
import com.abdul.accessportal.repository.RoleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoleServiceTest {

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PermissionRepository permissionRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private RoleService roleService;

    @Test
    void createRoleShouldCreateUppercaseRoleWithPermissions() {
        Permission userRead = new Permission();
        userRead.setId(2L);
        userRead.setName("USER_READ");
        userRead.setDescription("View users");

        Permission auditView = new Permission();
        auditView.setId(6L);
        auditView.setName("AUDIT_VIEW");
        auditView.setDescription("View audit logs");

        CreateRoleRequest request = new CreateRoleRequest();
        request.setName("support_admin");
        request.setDescription("Support admin role");
        request.setPermissionIds(Set.of(2L, 6L));

        when(roleRepository.existsByName("SUPPORT_ADMIN")).thenReturn(false);
        when(permissionRepository.findAllById(Set.of(2L, 6L))).thenReturn(List.of(userRead, auditView));
        when(roleRepository.save(any(Role.class))).thenAnswer(invocation -> {
            Role role = invocation.getArgument(0);
            role.setId(10L);
            role.setCreatedAt(LocalDateTime.now());
            return role;
        });

        RoleResponse response = roleService.createRole(request, "admin@accessportal.com");

        assertEquals(10L, response.getId());
        assertEquals("SUPPORT_ADMIN", response.getName());
        assertEquals("Support admin role", response.getDescription());
        assertTrue(response.getPermissions().contains("USER_READ"));
        assertTrue(response.getPermissions().contains("AUDIT_VIEW"));

        verify(auditService).log(
                eq("admin@accessportal.com"),
                eq("ROLE_CREATED"),
                contains("SUPPORT_ADMIN"),
                isNull()
        );
    }

    @Test
    void createRoleShouldThrowExceptionWhenRoleAlreadyExists() {
        CreateRoleRequest request = new CreateRoleRequest();
        request.setName("ADMIN");
        request.setDescription("Duplicate admin role");
        request.setPermissionIds(Set.of());

        when(roleRepository.existsByName("ADMIN")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> roleService.createRole(request, "admin@accessportal.com")
        );

        assertEquals("Role already exists", exception.getMessage());
        verify(roleRepository, never()).save(any(Role.class));
    }

    @Test
    void updateRoleShouldUpdateRoleAndPermissions() {
        Role existingRole = new Role();
        existingRole.setId(4L);
        existingRole.setName("SUPPORT_ADMIN");
        existingRole.setDescription("Old description");

        Permission userRead = new Permission();
        userRead.setId(2L);
        userRead.setName("USER_READ");

        Permission dashboardView = new Permission();
        dashboardView.setId(7L);
        dashboardView.setName("DASHBOARD_VIEW");

        UpdateRoleRequest request = new UpdateRoleRequest();
        request.setName("support_admin");
        request.setDescription("Updated support role");
        request.setPermissionIds(Set.of(2L, 7L));

        when(roleRepository.findById(4L)).thenReturn(Optional.of(existingRole));
        when(roleRepository.findByName("SUPPORT_ADMIN")).thenReturn(Optional.of(existingRole));
        when(permissionRepository.findAllById(Set.of(2L, 7L))).thenReturn(List.of(userRead, dashboardView));
        when(roleRepository.save(any(Role.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RoleResponse response = roleService.updateRole(4L, request, "admin@accessportal.com");

        assertEquals("SUPPORT_ADMIN", response.getName());
        assertEquals("Updated support role", response.getDescription());
        assertTrue(response.getPermissions().contains("USER_READ"));
        assertTrue(response.getPermissions().contains("DASHBOARD_VIEW"));

        verify(auditService).log(
                eq("admin@accessportal.com"),
                eq("ROLE_UPDATED"),
                contains("SUPPORT_ADMIN"),
                isNull()
        );
    }
}
