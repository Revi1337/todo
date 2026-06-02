package revi1337.todo.domain.health;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import revi1337.todo.common.ApiResponse;
import revi1337.todo.domain.todo.entity.Priority;
import revi1337.todo.domain.todo.service.TodoQueryService;
import revi1337.todo.domain.todo.service.dto.TodoFilterRequest;
import revi1337.todo.domain.todo.service.dto.TodoResponse;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final TodoQueryService todoQueryService;

    @GetMapping
    public ApiResponse<List<TodoResponse>> health(
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
}
