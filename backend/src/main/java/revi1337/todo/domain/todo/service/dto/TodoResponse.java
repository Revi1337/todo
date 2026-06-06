package revi1337.todo.domain.todo.service.dto;

import revi1337.todo.domain.category.service.dto.CategoryResponse;
import revi1337.todo.domain.tag.entity.Tag;
import revi1337.todo.domain.tag.service.dto.TagResponse;
import revi1337.todo.domain.todo.entity.Priority;
import revi1337.todo.domain.todo.entity.Todo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

public record TodoResponse(
        Long id,
        String title,
        String description,
        boolean completed,
        Priority priority,
        LocalDate dueDate,
        CategoryResponse category,
        Set<TagResponse> tags,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime completedAt,
        int position
) {
    public static TodoResponse from(Todo todo) {
        CategoryResponse category = todo.getCategory() != null
                ? CategoryResponse.from(todo.getCategory())
                : null;
        Set<TagResponse> tags = todo.getTags().stream()
                .map(TagResponse::from)
                .collect(Collectors.toSet());

        return new TodoResponse(
                todo.getId(), todo.getTitle(), todo.getDescription(),
                todo.isCompleted(), todo.getPriority(), todo.getDueDate(),
                category, tags,
                todo.getCreatedAt(), todo.getUpdatedAt(), todo.getCompletedAt(),
                todo.getPosition()
        );
    }

    public static TodoResponse from(Todo todo, Set<Tag> resolvedTags) {
        CategoryResponse category = todo.getCategory() != null
                ? CategoryResponse.from(todo.getCategory())
                : null;
        Set<TagResponse> tags = resolvedTags.stream()
                .map(TagResponse::from)
                .collect(Collectors.toSet());

        return new TodoResponse(
                todo.getId(), todo.getTitle(), todo.getDescription(),
                todo.isCompleted(), todo.getPriority(), todo.getDueDate(),
                category, tags,
                todo.getCreatedAt(), todo.getUpdatedAt(), todo.getCompletedAt(),
                todo.getPosition()
        );
    }
}
