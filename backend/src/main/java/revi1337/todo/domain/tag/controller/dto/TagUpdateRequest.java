package revi1337.todo.domain.tag.controller.dto;

import jakarta.validation.constraints.NotBlank;

public record TagUpdateRequest(
        @NotBlank String name,
        String color
) {
}
