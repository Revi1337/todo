package revi1337.todo.domain.todo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import revi1337.todo.domain.todo.entity.Priority;
import revi1337.todo.domain.todo.service.TodoService;
import revi1337.todo.domain.todo.service.dto.TodoFilterRequest;
import revi1337.todo.domain.todo.service.dto.TodoRequest;
import revi1337.todo.domain.todo.service.dto.TodoResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TodoController.class)
class TodoControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockitoBean private TodoService todoService;

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 5, 28, 0, 0);

    @Test
    @DisplayName("POST /api/todos — Todo를 생성하고 201을 반환한다")
    void create() throws Exception {
        given(todoService.create(any(TodoRequest.class))).willReturn(sampleTodoResponse());

        mockMvc.perform(post("/api/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new TodoRequest("스프링 공부", null, Priority.HIGH, null, null, null, null))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("스프링 공부"));
    }

    @Test
    @DisplayName("POST /api/todos — title이 blank면 400을 반환한다")
    void create_blankTitle_returns400() throws Exception {
        mockMvc.perform(post("/api/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new TodoRequest("", null, null, null, null, null, null))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/todos — 전체 목록을 반환한다")
    void findAll() throws Exception {
        given(todoService.findAll(any(TodoFilterRequest.class))).willReturn(List.of(sampleTodoResponse()));

        mockMvc.perform(get("/api/todos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    @DisplayName("PUT /api/todos/{id} — Todo를 수정하고 200을 반환한다")
    void updateTodo() throws Exception {
        given(todoService.update(any(), any(TodoRequest.class))).willReturn(sampleTodoResponse());

        mockMvc.perform(put("/api/todos/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new TodoRequest("스프링 공부", null, Priority.HIGH, null, null, null, true))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("DELETE /api/todos/{id} — 삭제 후 204를 반환한다")
    void deleteTodo() throws Exception {
        mockMvc.perform(delete("/api/todos/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/todos/{id} — 존재하지 않으면 404를 반환한다")
    void deleteTodo_notFound_returns404() throws Exception {
        willThrow(new EntityNotFoundException("Todo not found: 999"))
                .given(todoService).delete(999L);

        mockMvc.perform(delete("/api/todos/999"))
                .andExpect(status().isNotFound());
    }

    private TodoResponse sampleTodoResponse() {
        return new TodoResponse(1L, "스프링 공부", "JPA 챕터", false, Priority.HIGH, null, null, Set.of(), NOW, NOW, null);
    }
}
