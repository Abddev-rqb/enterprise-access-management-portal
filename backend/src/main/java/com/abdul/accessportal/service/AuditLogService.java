package com.abdul.accessportal.service;

import com.abdul.accessportal.dto.AuditLogResponse;
import com.abdul.accessportal.dto.PageResponse;
import com.abdul.accessportal.entity.AuditLog;
import com.abdul.accessportal.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAllAuditLogs() {
        return auditLogRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAuditLogsPage(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        var pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        var auditLogsPage = auditLogRepository.findAll(pageable);

        return new PageResponse<>(
                auditLogsPage.getContent().stream().map(this::toResponse).toList(),
                auditLogsPage.getNumber(),
                auditLogsPage.getSize(),
                auditLogsPage.getTotalElements(),
                auditLogsPage.getTotalPages(),
                auditLogsPage.isFirst(),
                auditLogsPage.isLast()
        );
    }

    public AuditLogResponse toResponse(AuditLog auditLog) {
        return new AuditLogResponse(
                auditLog.getId(),
                auditLog.getActorEmail(),
                auditLog.getAction(),
                auditLog.getDetails(),
                auditLog.getIpAddress(),
                auditLog.getCreatedAt()
        );
    }
}
