package com.abdul.accessportal.controller;

import com.abdul.accessportal.dto.PermissionResponse;
import com.abdul.accessportal.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping
    @PreAuthorize("hasAuthority('PERMISSION_MANAGE') or hasAuthority('ROLE_MANAGE')")
    public List<PermissionResponse> getAllPermissions() {
        return permissionService.getAllPermissions();
    }
}
