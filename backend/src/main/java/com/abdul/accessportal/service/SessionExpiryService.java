package com.abdul.accessportal.service;

import com.abdul.accessportal.entity.UserSession;
import com.abdul.accessportal.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SessionExpiryService {

    private final UserSessionRepository userSessionRepository;
    private final AuditService auditService;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Scheduled(fixedRate = 300000)
    @Transactional
    public void expireOldSessions() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusNanos(jwtExpirationMs * 1_000_000);

        userSessionRepository.findByActiveTrueAndLoginTimeBefore(cutoffTime)
                .forEach(this::expireSession);
    }

    private void expireSession(UserSession session) {
        session.setActive(false);
        session.setLogoutTime(LocalDateTime.now());
        userSessionRepository.save(session);

        auditService.log(
                session.getUser().getEmail(),
                "SESSION_EXPIRED",
                "User session expired automatically after JWT expiration window",
                null
        );
    }
}
