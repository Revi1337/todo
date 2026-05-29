package revi1337.todo.domain.category.service.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoryUpdateRequest(
        @NotBlank String name,
        @NotBlank String color
) {
}
