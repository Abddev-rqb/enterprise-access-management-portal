package com.abdul.accessportal.service;

import com.abdul.accessportal.dto.CreateUserRequest;
import com.abdul.accessportal.dto.PageResponse;
import com.abdul.accessportal.dto.UpdateUserRequest;
import com.abdul.accessportal.dto.UserResponse;
import com.abdul.accessportal.entity.Role;
import com.abdul.accessportal.entity.User;
import com.abdul.accessportal.repository.RoleRepository;
import com.abdul.accessportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUsersPage(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        var pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        var usersPage = userRepository.findAll(pageable);

        return new PageResponse<>(
                usersPage.getContent().stream().map(this::toResponse).toList(),
                usersPage.getNumber(),
                usersPage.getSize(),
                usersPage.getTotalElements(),
                usersPage.getTotalPages(),
                usersPage.isFirst(),
                usersPage.isLast()
        );
    }

    public UserResponse getUserById(Long id) {
        return toResponse(findUser(id));
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request, String actorEmail) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new IllegalArgumentException("Role not found"));

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(true);
        user.setRole(role);

        User savedUser = userRepository.save(user);

        auditService.log(actorEmail, "USER_CREATED", "Created user: " + savedUser.getEmail(), null);
        auditService.log(actorEmail, "USER_ROLE_ASSIGNED", "Assigned role " + role.getName() + " to user: " + savedUser.getEmail(), null);

        return toResponse(savedUser);
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request, String actorEmail) {
        User user = findUser(id);

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new IllegalArgumentException("Role not found"));

        String previousRole = user.getRole() != null ? user.getRole().getName() : null;

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setEnabled(request.isEnabled());
        user.setRole(role);

        User savedUser = userRepository.save(user);

        auditService.log(actorEmail, "USER_UPDATED", "Updated user: " + savedUser.getEmail(), null);

        if (previousRole == null || !previousRole.equals(role.getName())) {
            auditService.log(actorEmail, "USER_ROLE_ASSIGNED", "Changed role from " + previousRole + " to " + role.getName() + " for user: " + savedUser.getEmail(), null);
        }

        return toResponse(savedUser);
    }

    @Transactional
    public void disableUser(Long id, String actorEmail) {
        User user = findUser(id);
        user.setEnabled(false);
        userRepository.save(user);

        auditService.log(actorEmail, "USER_DISABLED", "Disabled user: " + user.getEmail(), null);
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.isEnabled(),
                user.getRole() != null ? user.getRole().getName() : null,
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
