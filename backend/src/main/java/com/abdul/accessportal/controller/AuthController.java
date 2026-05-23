package com.abdul.accessportal.controller;

import com.abdul.accessportal.dto.ApiResponse;
import com.abdul.accessportal.dto.AuthResponse;
import com.abdul.accessportal.dto.CurrentUserResponse;
import com.abdul.accessportal.dto.LoginRequest;
import com.abdul.accessportal.security.CustomUserPrincipal;
import com.abdul.accessportal.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpServletRequest
    ) {
        return authService.login(request, httpServletRequest.getRemoteAddr());
    }

    @GetMapping("/me")
    public CurrentUserResponse me(@AuthenticationPrincipal CustomUserPrincipal principal) {
        return authService.getCurrentUser(principal);
    }

    @PostMapping("/logout")
    public ApiResponse logout(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            HttpServletRequest request
    ) {
        String authHeader = request.getHeader("Authorization");
        String token = authHeader != null && authHeader.startsWith("Bearer ")
                ? authHeader.substring(7)
                : "";

        authService.logout(token, principal.getEmail(), request.getRemoteAddr());

        return new ApiResponse(true, "Logged out successfully");
    }
}
