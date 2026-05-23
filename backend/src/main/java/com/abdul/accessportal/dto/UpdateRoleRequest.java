package com.abdul.accessportal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class UpdateRoleRequest {

    @NotBlank(message = "Role name is required")
    private String name;

    private String description;

    private Set<Long> permissionIds;
}
