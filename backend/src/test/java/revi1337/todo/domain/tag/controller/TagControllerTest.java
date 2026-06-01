package revi1337.todo.domain.tag.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import revi1337.todo.domain.auth.AuthFilter;
import revi1337.todo.domain.tag.controller.dto.TagCreateRequest;
import revi1337.todo.domain.tag.controller.dto.TagUpdateRequest;
import revi1337.todo.domain.tag.service.TagCommandService;
import revi1337.todo.domain.tag.service.TagQueryService;
import revi1337.todo.domain.tag.service.dto.TagResponse;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willDoNothing;
import static org.mockito.BDDMockito.willThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TagController.class)
class TagControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockitoBean private TagQueryService tagQueryService;
    @MockitoBean private TagCommandService tagCommandService;

    private MockHttpSession authSession() {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute(AuthFilter.SESSION_KEY, true);
        return session;
    }

    @Test
    @DisplayName("POST /api/tags — Tag를 생성하고 201을 반환한다")
    void create() throws Exception {
        given(tagCommandService.save(any(), any())).willReturn(new TagResponse(1L, "JPA", "#94a3b8"));

        mockMvc.perform(post("/api/tags").session(authSession())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TagCreateRequest("JPA", "#94a3b8"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("JPA"));
    }

    @Test
    @DisplayName("POST /api/tags — name이 blank면 400을 반환한다")
    void create_blankName_returns400() throws Exception {
        mockMvc.perform(post("/api/tags").session(authSession())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TagCreateRequest("", null))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/tags — 전체 목록을 반환한다")
    void findAll() throws Exception {
        given(tagQueryService.findAll()).willReturn(List.of(
                new TagResponse(1L, "JPA", "#94a3b8"),
                new TagResponse(2L, "Spring", "#6366f1")));

        mockMvc.perform(get("/api/tags"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    @DisplayName("PUT /api/tags/{id} — Tag를 수정하고 200을 반환한다")
    void update() throws Exception {
        given(tagCommandService.update(eq(1L), any(), any()))
                .willReturn(new TagResponse(1L, "Kotlin", "#6366f1"));

        mockMvc.perform(put("/api/tags/1").session(authSession())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TagUpdateRequest("Kotlin", "#6366f1"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Kotlin"));
    }

    @Test
    @DisplayName("PUT /api/tags/{id} — 존재하지 않으면 404를 반환한다")
    void update_notFound_returns404() throws Exception {
        given(tagCommandService.update(eq(999L), any(), any()))
                .willThrow(new EntityNotFoundException("Tag not found: 999"));

        mockMvc.perform(put("/api/tags/999").session(authSession())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TagUpdateRequest("Kotlin", "#6366f1"))))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/tags/{id} — 삭제 후 204를 반환한다")
    void deleteById() throws Exception {
        willDoNothing().given(tagCommandService).deleteById(1L);

        mockMvc.perform(delete("/api/tags/1").session(authSession()))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/tags/{id} — 존재하지 않으면 404를 반환한다")
    void deleteById_notFound_returns404() throws Exception {
        willThrow(new EntityNotFoundException("Tag not found: 999"))
                .given(tagCommandService).deleteById(999L);

        mockMvc.perform(delete("/api/tags/999").session(authSession()))
                .andExpect(status().isNotFound());
    }
}
