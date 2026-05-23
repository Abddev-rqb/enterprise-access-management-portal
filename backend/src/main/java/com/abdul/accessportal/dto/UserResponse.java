package com.abdul.accessportal.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private boolean enabled;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
