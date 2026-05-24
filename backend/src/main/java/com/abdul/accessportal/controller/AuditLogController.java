package com.abdul.accessportal.controller;

import com.abdul.accessportal.dto.AuditLogResponse;
import com.abdul.accessportal.dto.PageResponse;
import com.abdul.accessportal.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAuthority('AUDIT_VIEW')")
    public List<AuditLogResponse> getAllAuditLogs() {
        return auditLogService.getAllAuditLogs();
    }

    @GetMapping("/page")
    @PreAuthorize("hasAuthority('AUDIT_VIEW')")
    public PageResponse<AuditLogResponse> getAuditLogsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return auditLogService.getAuditLogsPage(page, size);
    }
}
