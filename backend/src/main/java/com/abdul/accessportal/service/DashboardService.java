package com.abdul.accessportal.service;

import com.abdul.accessportal.dto.AuditLogResponse;
import com.abdul.accessportal.dto.DashboardResponse;
import com.abdul.accessportal.repository.AuditLogRepository;
import com.abdul.accessportal.repository.RoleRepository;
import com.abdul.accessportal.repository.UserRepository;
import com.abdul.accessportal.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserSessionRepository userSessionRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuditLogService auditLogService;

    public DashboardResponse getDashboardSummary() {
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);

        List<AuditLogResponse> recentActivities = auditLogRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(auditLogService::toResponse)
                .toList();

        return new DashboardResponse(
                userRepository.count(),
                userRepository.countByEnabledTrue(),
                roleRepository.count(),
                userSessionRepository.countByLoginTimeAfter(last24Hours),
                auditLogRepository.countByCreatedAtAfter(last24Hours),
                recentActivities
        );
    }
}
