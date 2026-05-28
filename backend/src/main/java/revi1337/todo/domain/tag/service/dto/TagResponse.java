package revi1337.todo.domain.tag.service.dto;

import revi1337.todo.domain.tag.entity.Tag;

public record TagResponse(Long id, String name, String color) {

    public static TagResponse from(Tag tag) {
        return new TagResponse(tag.getId(), tag.getName(), tag.getColor());
    }
}
