package com.abdul.accessportal.controller;

import com.abdul.accessportal.dto.PageResponse;
import com.abdul.accessportal.dto.SessionResponse;
import com.abdul.accessportal.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping
    @PreAuthorize("hasAuthority('AUDIT_VIEW')")
    public List<SessionResponse> getAllSessions() {
        return sessionService.getAllSessions();
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('AUDIT_VIEW')")
    public List<SessionResponse> getActiveSessions() {
        return sessionService.getActiveSessions();
    }

    @GetMapping("/page")
    @PreAuthorize("hasAuthority('AUDIT_VIEW')")
    public PageResponse<SessionResponse> getSessionsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return sessionService.getSessionsPage(page, size);
    }
}
