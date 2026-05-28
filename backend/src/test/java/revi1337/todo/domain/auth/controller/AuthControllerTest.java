package revi1337.todo.domain.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import revi1337.todo.domain.auth.AuthController;
import revi1337.todo.domain.auth.AuthFilter;
import revi1337.todo.domain.auth.LoginRequest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@TestPropertySource(properties = "app.password=test1234")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/auth/login — 올바른 비밀번호면 세션을 발급하고 200을 반환한다")
    void login_success() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("test1234"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(request().sessionAttribute(AuthFilter.SESSION_KEY, true));
    }

    @Test
    @DisplayName("POST /api/auth/login — 잘못된 비밀번호면 세션 없이 success=false를 반환한다")
    void login_wrongPassword() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("wrong"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(request().sessionAttributeDoesNotExist(AuthFilter.SESSION_KEY));
    }

    @Test
    @DisplayName("POST /api/auth/logout — 세션을 무효화하고 200을 반환한다")
    void logout() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute(AuthFilter.SESSION_KEY, true);

        mockMvc.perform(post("/api/auth/logout").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("GET /api/auth/me — 인증된 세션이면 true를 반환한다")
    void me_authenticated() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute(AuthFilter.SESSION_KEY, true);

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("GET /api/auth/me — 세션이 없으면 false를 반환한다")
    void me_unauthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(false));
    }
}
