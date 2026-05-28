package revi1337.todo.domain.category.service.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoryCreateRequest(
        @NotBlank String name,
        @NotBlank String color
) {
}
