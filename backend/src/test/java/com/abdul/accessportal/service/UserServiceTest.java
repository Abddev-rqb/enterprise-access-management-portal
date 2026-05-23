package com.abdul.accessportal.service;

import com.abdul.accessportal.dto.CreateUserRequest;
import com.abdul.accessportal.dto.UpdateUserRequest;
import com.abdul.accessportal.dto.UserResponse;
import com.abdul.accessportal.entity.Role;
import com.abdul.accessportal.entity.User;
import com.abdul.accessportal.repository.RoleRepository;
import com.abdul.accessportal.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private UserService userService;

    @Test
    void createUserShouldCreateUserWithEncodedPasswordAndRole() {
        Role role = new Role();
        role.setId(1L);
        role.setName("MANAGER");

        CreateUserRequest request = new CreateUserRequest();
        request.setFullName("Test Manager");
        request.setEmail("manager@test.com");
        request.setPassword("manager123");
        request.setRoleId(1L);

        User savedUser = new User();
        savedUser.setId(10L);
        savedUser.setFullName(request.getFullName());
        savedUser.setEmail(request.getEmail());
        savedUser.setPassword("encoded-password");
        savedUser.setEnabled(true);
        savedUser.setRole(role);
        savedUser.setCreatedAt(LocalDateTime.now());

        when(userRepository.existsByEmail("manager@test.com")).thenReturn(false);
        when(roleRepository.findById(1L)).thenReturn(Optional.of(role));
        when(passwordEncoder.encode("manager123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserResponse response = userService.createUser(request, "admin@accessportal.com");

        assertEquals(10L, response.getId());
        assertEquals("Test Manager", response.getFullName());
        assertEquals("manager@test.com", response.getEmail());
        assertEquals("MANAGER", response.getRole());
        assertTrue(response.isEnabled());

        verify(userRepository).save(any(User.class));
        verify(auditService).log(
                eq("admin@accessportal.com"),
                eq("USER_CREATED"),
                contains("manager@test.com"),
                isNull()
        );
    }

    @Test
    void createUserShouldThrowExceptionWhenEmailAlreadyExists() {
        CreateUserRequest request = new CreateUserRequest();
        request.setFullName("Existing User");
        request.setEmail("existing@test.com");
        request.setPassword("password123");
        request.setRoleId(1L);

        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.createUser(request, "admin@accessportal.com")
        );

        assertEquals("Email already exists", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateUserShouldUpdateUserDetailsAndRole() {
        Role oldRole = new Role();
        oldRole.setId(1L);
        oldRole.setName("AUDITOR");

        Role newRole = new Role();
        newRole.setId(2L);
        newRole.setName("MANAGER");

        User existingUser = new User();
        existingUser.setId(5L);
        existingUser.setFullName("Old Name");
        existingUser.setEmail("old@test.com");
        existingUser.setEnabled(true);
        existingUser.setRole(oldRole);
        existingUser.setCreatedAt(LocalDateTime.now());

        UpdateUserRequest request = new UpdateUserRequest();
        request.setFullName("Updated Name");
        request.setEmail("updated@test.com");
        request.setRoleId(2L);
        request.setEnabled(false);

        when(userRepository.findById(5L)).thenReturn(Optional.of(existingUser));
        when(userRepository.existsByEmail("updated@test.com")).thenReturn(false);
        when(roleRepository.findById(2L)).thenReturn(Optional.of(newRole));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.updateUser(5L, request, "admin@accessportal.com");

        assertEquals("Updated Name", response.getFullName());
        assertEquals("updated@test.com", response.getEmail());
        assertEquals("MANAGER", response.getRole());
        assertFalse(response.isEnabled());

        verify(auditService).log(
                eq("admin@accessportal.com"),
                eq("USER_UPDATED"),
                contains("updated@test.com"),
                isNull()
        );
    }

    @Test
    void disableUserShouldMarkUserDisabled() {
        Role role = new Role();
        role.setName("MANAGER");

        User user = new User();
        user.setId(7L);
        user.setFullName("Disable Me");
        user.setEmail("disable@test.com");
        user.setEnabled(true);
        user.setRole(role);

        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userService.disableUser(7L, "admin@accessportal.com");

        assertFalse(user.isEnabled());

        verify(userRepository).save(user);
        verify(auditService).log(
                eq("admin@accessportal.com"),
                eq("USER_DISABLED"),
                contains("disable@test.com"),
                isNull()
        );
    }
}
