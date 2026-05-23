package com.abdul.accessportal.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PermissionResponse {
    private Long id;
    private String name;
    private String description;
}
