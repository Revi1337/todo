package revi1337.todo.domain.todo.service.dto;

import jakarta.validation.constraints.NotBlank;
import revi1337.todo.domain.todo.entity.Priority;

import java.time.LocalDate;
import java.util.List;

public record TodoRequest(
        @NotBlank String title,
        String description,
        Priority priority,
        LocalDate dueDate,
        Long categoryId,
        List<Long> tagIds,
        Boolean completed
) {
}
