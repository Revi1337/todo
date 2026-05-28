package revi1337.todo.domain.todo.service.dto;

import revi1337.todo.domain.todo.entity.Priority;

import java.time.LocalDate;

public record TodoFilterRequest(
        Long category,
        Long tag,
        Priority priority,
        Boolean completed,
        String search,
        LocalDate dueDate
) {
}
