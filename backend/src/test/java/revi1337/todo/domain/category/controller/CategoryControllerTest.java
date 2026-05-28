package revi1337.todo.domain.category.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import revi1337.todo.domain.category.service.dto.CategoryCreateRequest;
import revi1337.todo.domain.category.entity.Category;
import revi1337.todo.domain.category.service.CategoryService;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willDoNothing;
import static org.mockito.ArgumentMatchers.any;
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

    @Test
    @DisplayName("POST /api/categories — Category를 생성하고 201을 반환한다")
    void create() throws Exception {
        Category category = new Category("개발", "#6366f1", LocalDateTime.now());
        given(categoryService.save(any(), any())).willReturn(category);

        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CategoryCreateRequest("개발", "#6366f1"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("개발"));
    }

    @Test
    @DisplayName("POST /api/categories — name이 blank면 400을 반환한다")
    void create_blankName_returns400() throws Exception {
        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CategoryCreateRequest("", "#6366f1"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/categories — 전체 목록을 반환한다")
    void findAll() throws Exception {
        given(categoryService.findAll()).willReturn(List.of(
                new Category("개발", "#6366f1", LocalDateTime.now()),
                new Category("운동", "#f59e0b", LocalDateTime.now())
        ));

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    @DisplayName("DELETE /api/categories/{id} — 삭제 후 204를 반환한다")
    void deleteById() throws Exception {
        willDoNothing().given(categoryService).deleteById(1L);

        mockMvc.perform(delete("/api/categories/1"))
                .andExpect(status().isNoContent());
    }
}
