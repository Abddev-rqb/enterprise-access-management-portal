package com.abdul.accessportal.service;

import com.abdul.accessportal.dto.PageResponse;
import com.abdul.accessportal.dto.SessionResponse;
import com.abdul.accessportal.entity.User;
import com.abdul.accessportal.entity.UserSession;
import com.abdul.accessportal.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final UserSessionRepository userSessionRepository;

    @Transactional(readOnly = true)
    public List<SessionResponse> getAllSessions() {
        return userSessionRepository.findAllByOrderByLoginTimeDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getActiveSessions() {
        return userSessionRepository.findByActiveTrueOrderByLoginTimeDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<SessionResponse> getSessionsPage(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        var pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "loginTime"));
        var sessionsPage = userSessionRepository.findAll(pageable);

        return new PageResponse<>(
                sessionsPage.getContent().stream().map(this::toResponse).toList(),
                sessionsPage.getNumber(),
                sessionsPage.getSize(),
                sessionsPage.getTotalElements(),
                sessionsPage.getTotalPages(),
                sessionsPage.isFirst(),
                sessionsPage.isLast()
        );
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
