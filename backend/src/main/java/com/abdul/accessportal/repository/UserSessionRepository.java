package com.abdul.accessportal.repository;

import com.abdul.accessportal.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findByTokenAndActiveTrue(String token);
    long countByLoginTimeAfter(LocalDateTime loginTime);
    List<UserSession> findAllByOrderByLoginTimeDesc();
    List<UserSession> findByActiveTrueOrderByLoginTimeDesc();
    List<UserSession> findByActiveTrueAndLoginTimeBefore(LocalDateTime cutoffTime);
}
