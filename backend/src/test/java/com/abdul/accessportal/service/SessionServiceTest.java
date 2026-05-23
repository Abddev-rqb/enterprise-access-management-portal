package com.abdul.accessportal.service;

import com.abdul.accessportal.dto.SessionResponse;
import com.abdul.accessportal.entity.Role;
import com.abdul.accessportal.entity.User;
import com.abdul.accessportal.entity.UserSession;
import com.abdul.accessportal.repository.UserSessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    private UserSessionRepository userSessionRepository;

    @InjectMocks
    private SessionService sessionService;

    @Test
    void getAllSessionsShouldReturnSessionResponses() {
        UserSession session = createSession(true);

        when(userSessionRepository.findAllByOrderByLoginTimeDesc()).thenReturn(List.of(session));

        List<SessionResponse> responses = sessionService.getAllSessions();

        assertEquals(1, responses.size());
        assertEquals("Admin User", responses.get(0).getFullName());
        assertEquals("admin@accessportal.com", responses.get(0).getEmail());
        assertEquals("ADMIN", responses.get(0).getRole());
        assertTrue(responses.get(0).isActive());
    }

    @Test
    void getActiveSessionsShouldReturnOnlyActiveSessions() {
        UserSession activeSession = createSession(true);

        when(userSessionRepository.findByActiveTrueOrderByLoginTimeDesc()).thenReturn(List.of(activeSession));

        List<SessionResponse> responses = sessionService.getActiveSessions();

        assertEquals(1, responses.size());
        assertTrue(responses.get(0).isActive());

        verify(userSessionRepository).findByActiveTrueOrderByLoginTimeDesc();
    }

    private UserSession createSession(boolean active) {
        Role role = new Role();
        role.setId(1L);
        role.setName("ADMIN");

        User user = new User();
        user.setId(1L);
        user.setFullName("Admin User");
        user.setEmail("admin@accessportal.com");
        user.setRole(role);

        UserSession session = new UserSession();
        session.setId(100L);
        session.setUser(user);
        session.setToken("test-token");
        session.setActive(active);
        session.setLoginTime(LocalDateTime.now());

        if (!active) {
            session.setLogoutTime(LocalDateTime.now());
        }

        return session;
    }
}
