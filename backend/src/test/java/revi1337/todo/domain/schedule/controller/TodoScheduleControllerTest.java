package revi1337.todo.domain.schedule.controller;

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
import revi1337.todo.common.exception.DuplicateScheduleException;
import revi1337.todo.domain.auth.AuthFilter;
import revi1337.todo.domain.schedule.service.TodoScheduleCommandService;
import revi1337.todo.domain.schedule.service.TodoScheduleQueryService;
import revi1337.todo.domain.schedule.service.dto.ScheduleRequest;
import revi1337.todo.domain.schedule.service.dto.ScheduleResponse;
import revi1337.todo.domain.schedule.service.dto.ScheduleUpdateRequest;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TodoScheduleController.class)
class TodoScheduleControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockitoBean private TodoScheduleQueryService todoScheduleQueryService;
    @MockitoBean private TodoScheduleCommandService todoScheduleCommandService;

    private static final LocalDate DATE = LocalDate.of(2026, 6, 3);
    private static final LocalTime START = LocalTime.of(10, 0);
    private static final LocalTime END = LocalTime.of(11, 0);

    private MockHttpSession authSession() {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute(AuthFilter.SESSION_KEY, true);
        return session;
    }

    private ScheduleResponse sampleResponse() {
        return new ScheduleResponse(1L, 42L, START, END, DATE);
    }

    @Test
    @DisplayName("GET /api/todo-schedules?date= — 날짜별 스케줄 목록을 200으로 반환한다")
    void findByDate() throws Exception {
        given(todoScheduleQueryService.findByDate(DATE)).willReturn(List.of(sampleResponse()));

        mockMvc.perform(get("/api/todo-schedules").param("date", "2026-06-03"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].todoId").value(42));
    }

    @Test
    @DisplayName("POST /api/todo-schedules — 스케줄을 생성하고 201을 반환한다")
    void create() throws Exception {
        given(todoScheduleCommandService.create(any(ScheduleRequest.class))).willReturn(sampleResponse());

        mockMvc.perform(post("/api/todo-schedules").session(authSession())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new ScheduleRequest(42L, START, END, DATE))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.startTime").value("10:00:00"))
                .andExpect(jsonPath("$.data.endTime").value("11:00:00"));
    }

    @Test
    @DisplayName("POST /api/todo-schedules — todoId가 null이면 400을 반환한다")
    void create_nullTodoId_returns400() throws Exception {
        mockMvc.perform(post("/api/todo-schedules").session(authSession())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"todoId\":null,\"startTime\":\"10:00:00\",\"endTime\":\"11:00:00\",\"scheduleDate\":\"2026-06-03\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/todo-schedules — 중복 스케줄이면 409를 반환한다")
    void create_duplicate_returns409() throws Exception {
        given(todoScheduleCommandService.create(any(ScheduleRequest.class)))
                .willThrow(new DuplicateScheduleException("이미 스케줄이 존재합니다: todoId=42"));

        mockMvc.perform(post("/api/todo-schedules").session(authSession())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new ScheduleRequest(42L, START, END, DATE))))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("PUT /api/todo-schedules/{id} — 스케줄 시간을 수정하고 200을 반환한다")
    void update() throws Exception {
        LocalTime newStart = LocalTime.of(14, 0);
        LocalTime newEnd = LocalTime.of(15, 30);
        ScheduleResponse updated = new ScheduleResponse(1L, 42L, newStart, newEnd, DATE);
        given(todoScheduleCommandService.update(eq(1L), any(ScheduleUpdateRequest.class))).willReturn(updated);

        mockMvc.perform(put("/api/todo-schedules/1").session(authSession())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ScheduleUpdateRequest(newStart, newEnd))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.startTime").value("14:00:00"));
    }

    @Test
    @DisplayName("PUT /api/todo-schedules/{id} — 존재하지 않으면 404를 반환한다")
    void update_notFound_returns404() throws Exception {
        given(todoScheduleCommandService.update(eq(999L), any(ScheduleUpdateRequest.class)))
                .willThrow(new EntityNotFoundException("Schedule not found: 999"));

        mockMvc.perform(put("/api/todo-schedules/999").session(authSession())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ScheduleUpdateRequest(START, END))))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/todo-schedules/{id} — 삭제 후 204를 반환한다")
    void deleteSchedule() throws Exception {
        mockMvc.perform(delete("/api/todo-schedules/1").session(authSession()))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/todo-schedules/{id} — 존재하지 않으면 404를 반환한다")
    void deleteSchedule_notFound_returns404() throws Exception {
        willThrow(new EntityNotFoundException("Schedule not found: 999"))
                .given(todoScheduleCommandService).delete(999L);

        mockMvc.perform(delete("/api/todo-schedules/999").session(authSession()))
                .andExpect(status().isNotFound());
    }
}
