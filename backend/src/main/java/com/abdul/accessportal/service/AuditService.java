package com.abdul.accessportal.service;

import com.abdul.accessportal.entity.AuditLog;
import com.abdul.accessportal.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(String actorEmail, String action, String details, String ipAddress) {
        AuditLog auditLog = new AuditLog();
        auditLog.setActorEmail(actorEmail);
        auditLog.setAction(action);
        auditLog.setDetails(details);
        auditLog.setIpAddress(ipAddress);

        auditLogRepository.save(auditLog);
    }
}
