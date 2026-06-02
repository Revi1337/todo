package revi1337.todo.domain.todo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import revi1337.todo.common.ApiResponse;
import revi1337.todo.domain.todo.entity.Priority;
import revi1337.todo.domain.todo.service.TodoCommandService;
import revi1337.todo.domain.todo.service.TodoQueryService;
import revi1337.todo.domain.todo.service.dto.ReorderRequest;
import revi1337.todo.domain.todo.service.dto.TodoFilterRequest;
import revi1337.todo.domain.todo.service.dto.TodoPatchRequest;
import revi1337.todo.domain.todo.service.dto.TodoRequest;
import revi1337.todo.domain.todo.service.dto.TodoResponse;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {

    private final TodoQueryService todoQueryService;
    private final TodoCommandService todoCommandService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TodoResponse> create(@RequestBody @Valid TodoRequest request) {
        return ApiResponse.ok(todoCommandService.create(request));
    }

    @GetMapping
    public ApiResponse<List<TodoResponse>> findAll(
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) Long tag,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Boolean completed,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDateTo) {
        return ApiResponse.ok(todoQueryService.findAll(
                new TodoFilterRequest(category, tag, priority, completed, search, dueDate, dueDateFrom, dueDateTo)));
    }

    @GetMapping("/{id}")
    public ApiResponse<TodoResponse> findById(@PathVariable Long id) {
        return ApiResponse.ok(todoQueryService.findById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<TodoResponse> update(@PathVariable Long id, @RequestBody @Valid TodoRequest request) {
        return ApiResponse.ok(todoCommandService.update(id, request));
    }

    @PatchMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void patch(@PathVariable Long id, @RequestBody TodoPatchRequest request) {
        todoCommandService.patch(id, request);
    }

    @PatchMapping("/reorder")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reorder(@RequestBody ReorderRequest request) {
        todoCommandService.reorder(request.items());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        todoCommandService.delete(id);
    }
}
