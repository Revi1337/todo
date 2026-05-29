package revi1337.todo.domain.category.controller;

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
import revi1337.todo.domain.category.service.CategoryService;
import revi1337.todo.domain.category.service.dto.CategoryCreateRequest;
import revi1337.todo.domain.category.service.dto.CategoryResponse;
import revi1337.todo.domain.category.service.dto.CategoryUpdateRequest;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willDoNothing;
import static org.mockito.BDDMockito.willThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CategoryController.class)
class CategoryControllerTest {

        @Autowired
        private MockMvc mockMvc;
        @Autowired
        private ObjectMapper objectMapper;
        @MockitoBean
        private CategoryService categoryService;

        private static final LocalDateTime NOW = LocalDateTime.of(2026, 5, 28, 0, 0);

        private MockHttpSession authSession() {
                MockHttpSession session = new MockHttpSession();
                session.setAttribute(AuthFilter.SESSION_KEY, true);
                return session;
        }

        @Test
        @DisplayName("POST /api/categories — Category를 생성하고 201을 반환한다")
        void create() throws Exception {
                given(categoryService.save(any(), any()))
                                .willReturn(new CategoryResponse(1L, "개발", "#6366f1", NOW));

                mockMvc.perform(post("/api/categories").session(authSession())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(new CategoryCreateRequest("개발", "#6366f1"))))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.name").value("개발"));
        }

        @Test
        @DisplayName("POST /api/categories — name이 blank면 400을 반환한다")
        void create_blankName_returns400() throws Exception {
                mockMvc.perform(post("/api/categories").session(authSession())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(new CategoryCreateRequest("", "#6366f1"))))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("GET /api/categories — 전체 목록을 반환한다")
        void findAll() throws Exception {
                given(categoryService.findAll()).willReturn(List.of(
                                new CategoryResponse(1L, "개발", "#6366f1", NOW),
                                new CategoryResponse(2L, "운동", "#f59e0b", NOW)));

                mockMvc.perform(get("/api/categories"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.length()").value(2));
        }

        @Test
        @DisplayName("PUT /api/categories/{id} — Category를 수정하고 200을 반환한다")
        void update() throws Exception {
                given(categoryService.update(eq(1L), any(), any()))
                                .willReturn(new CategoryResponse(1L, "업무", "#f59e0b", NOW));

                mockMvc.perform(put("/api/categories/1").session(authSession())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(new CategoryUpdateRequest("업무", "#f59e0b"))))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.name").value("업무"))
                                .andExpect(jsonPath("$.data.color").value("#f59e0b"));
        }

        @Test
        @DisplayName("PUT /api/categories/{id} — 존재하지 않으면 404를 반환한다")
        void update_notFound_returns404() throws Exception {
                given(categoryService.update(eq(999L), any(), any()))
                                .willThrow(new EntityNotFoundException("Category not found: 999"));

                mockMvc.perform(put("/api/categories/999").session(authSession())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(new CategoryUpdateRequest("업무", "#f59e0b"))))
                                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("DELETE /api/categories/{id} — 삭제 후 204를 반환한다")
        void deleteById() throws Exception {
                willDoNothing().given(categoryService).deleteById(1L);

                mockMvc.perform(delete("/api/categories/1").session(authSession()))
                                .andExpect(status().isNoContent());
        }
}
