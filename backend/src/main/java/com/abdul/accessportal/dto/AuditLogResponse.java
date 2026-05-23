package com.abdul.accessportal.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private String actorEmail;
    private String action;
    private String details;
    private String ipAddress;
    private LocalDateTime createdAt;
}
