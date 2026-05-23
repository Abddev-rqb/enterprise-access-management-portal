package com.abdul.accessportal.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class SessionResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String role;
    private boolean active;
    private LocalDateTime loginTime;
    private LocalDateTime logoutTime;
}
