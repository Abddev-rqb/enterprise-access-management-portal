package com.abdul.accessportal.controller;

import com.abdul.accessportal.dto.CreateRoleRequest;
import com.abdul.accessportal.dto.RoleResponse;
import com.abdul.accessportal.dto.UpdateRoleRequest;
import com.abdul.accessportal.security.CustomUserPrincipal;
import com.abdul.accessportal.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_MANAGE') or hasAuthority('ROLE_ASSIGN')")
    public List<RoleResponse> getAllRoles() {
        return roleService.getAllRoles();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGE') or hasAuthority('ROLE_ASSIGN')")
    public RoleResponse getRoleById(@PathVariable Long id) {
        return roleService.getRoleById(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    public RoleResponse createRole(
            @Valid @RequestBody CreateRoleRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        return roleService.createRole(request, principal.getEmail());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    public RoleResponse updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        return roleService.updateRole(id, request, principal.getEmail());
    }
}
