package com.abdul.accessportal.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class DashboardResponse {
    private long totalUsers;
    private long activeUsers;
    private long rolesCount;
    private long recentLoginCount;
    private long recentAuditCount;
    private List<AuditLogResponse> recentAuditActivities;
}
