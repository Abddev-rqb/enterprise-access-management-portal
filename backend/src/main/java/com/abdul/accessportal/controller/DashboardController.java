package com.abdul.accessportal.controller;

import com.abdul.accessportal.dto.DashboardResponse;
import com.abdul.accessportal.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @PreAuthorize("hasAuthority('DASHBOARD_VIEW')")
    public DashboardResponse getDashboardSummary() {
        return dashboardService.getDashboardSummary();
    }
}
