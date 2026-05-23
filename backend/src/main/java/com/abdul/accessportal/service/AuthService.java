package com.abdul.accessportal.service;

import com.abdul.accessportal.dto.AuthResponse;
import com.abdul.accessportal.dto.CurrentUserResponse;
import com.abdul.accessportal.dto.LoginRequest;
import com.abdul.accessportal.entity.User;
import com.abdul.accessportal.entity.UserSession;
import com.abdul.accessportal.repository.UserRepository;
import com.abdul.accessportal.repository.UserSessionRepository;
import com.abdul.accessportal.security.CustomUserPrincipal;
import com.abdul.accessportal.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final JwtService jwtService;
    private final AuditService auditService;

    @Transactional
    public AuthResponse login(LoginRequest request, String ipAddress) {
        try {
            var authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
            String token = jwtService.generateToken(principal);

            User user = userRepository.findByEmail(principal.getEmail())
                    .orElseThrow(() -> new BadCredentialsException("Invalid login credentials"));

            UserSession session = new UserSession();
            session.setUser(user);
            session.setToken(token);
            session.setActive(true);
            userSessionRepository.save(session);

            auditService.log(
                    principal.getEmail(),
                    "LOGIN_SUCCESS",
                    "User logged in successfully",
                    ipAddress
            );

            return new AuthResponse(
                    token,
                    "Bearer",
                    principal.getId(),
                    principal.getFullName(),
                    principal.getEmail(),
                    principal.getRole(),
                    principal.getPermissions()
            );

        } catch (Exception ex) {
            auditService.log(
                    request.getEmail(),
                    "LOGIN_FAILED",
                    "Failed login attempt",
                    ipAddress
            );

            throw new BadCredentialsException("Invalid email or password");
        }
    }

    public CurrentUserResponse getCurrentUser(CustomUserPrincipal principal) {
        return new CurrentUserResponse(
                principal.getId(),
                principal.getFullName(),
                principal.getEmail(),
                principal.isEnabled(),
                principal.getRole(),
                principal.getPermissions()
        );
    }

    @Transactional
    public void logout(String token, String actorEmail, String ipAddress) {
        userSessionRepository.findByTokenAndActiveTrue(token)
                .ifPresent(session -> {
                    session.setActive(false);
                    session.setLogoutTime(LocalDateTime.now());
                    userSessionRepository.save(session);
                });

        auditService.log(
                actorEmail,
                "LOGOUT",
                "User logged out successfully",
                ipAddress
        );
    }
}
