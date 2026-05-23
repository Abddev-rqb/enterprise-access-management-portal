package com.abdul.accessportal.controller;

import com.abdul.accessportal.dto.ApiResponse;
import com.abdul.accessportal.dto.CreateUserRequest;
import com.abdul.accessportal.dto.UpdateUserRequest;
import com.abdul.accessportal.dto.UserResponse;
import com.abdul.accessportal.security.CustomUserPrincipal;
import com.abdul.accessportal.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAuthority('USER_READ')")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_READ')")
    public UserResponse getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public UserResponse createUser(
            @Valid @RequestBody CreateUserRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        return userService.createUser(request, principal.getEmail());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public UserResponse updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        return userService.updateUser(id, request, principal.getEmail());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_DELETE')")
    public ApiResponse disableUser(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        userService.disableUser(id, principal.getEmail());
        return new ApiResponse(true, "User disabled successfully");
    }
}
