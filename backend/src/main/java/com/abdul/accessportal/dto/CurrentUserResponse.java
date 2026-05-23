package com.abdul.accessportal.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Set;

@Getter
@AllArgsConstructor
public class CurrentUserResponse {
    private Long id;
    private String fullName;
    private String email;
    private boolean enabled;
    private String role;
    private Set<String> permissions;
}
