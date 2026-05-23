package com.abdul.accessportal.service;

import com.abdul.accessportal.dto.SessionResponse;
import com.abdul.accessportal.entity.User;
import com.abdul.accessportal.entity.UserSession;
import com.abdul.accessportal.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final UserSessionRepository userSessionRepository;

    public List<SessionResponse> getAllSessions() {
        return userSessionRepository.findAllByOrderByLoginTimeDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<SessionResponse> getActiveSessions() {
        return userSessionRepository.findByActiveTrueOrderByLoginTimeDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private SessionResponse toResponse(UserSession session) {
        User user = session.getUser();

        return new SessionResponse(
                session.getId(),
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().getName() : null,
                session.isActive(),
                session.getLoginTime(),
                session.getLogoutTime()
        );
    }
}
