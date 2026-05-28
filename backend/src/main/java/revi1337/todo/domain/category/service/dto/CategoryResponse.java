package revi1337.todo.domain.category.service.dto;

import revi1337.todo.domain.category.entity.Category;

import java.time.LocalDateTime;

public record CategoryResponse(Long id, String name, String color, LocalDateTime createdAt) {

    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getColor(),
                category.getCreatedAt()
        );
    }
}
