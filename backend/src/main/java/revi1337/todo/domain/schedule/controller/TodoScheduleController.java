package revi1337.todo.domain.schedule.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import revi1337.todo.common.ApiResponse;
import revi1337.todo.domain.schedule.service.TodoScheduleCommandService;
import revi1337.todo.domain.schedule.service.TodoScheduleQueryService;
import revi1337.todo.domain.schedule.service.dto.ScheduleRequest;
import revi1337.todo.domain.schedule.service.dto.ScheduleResponse;
import revi1337.todo.domain.schedule.service.dto.ScheduleUpdateRequest;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/todo-schedules")
@RequiredArgsConstructor
public class TodoScheduleController {

    private final TodoScheduleQueryService todoScheduleQueryService;
    private final TodoScheduleCommandService todoScheduleCommandService;

    @GetMapping
    public ApiResponse<List<ScheduleResponse>> findByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ApiResponse.ok(todoScheduleQueryService.findByDate(date));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ScheduleResponse> create(@RequestBody @Valid ScheduleRequest request) {
        return ApiResponse.ok(todoScheduleCommandService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ScheduleResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid ScheduleUpdateRequest request) {
        return ApiResponse.ok(todoScheduleCommandService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        todoScheduleCommandService.delete(id);
    }
}
