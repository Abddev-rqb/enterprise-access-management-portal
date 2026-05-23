package com.abdul.accessportal.repository;

import com.abdul.accessportal.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop10ByOrderByCreatedAtDesc();
    long countByCreatedAtAfter(LocalDateTime createdAt);
}
