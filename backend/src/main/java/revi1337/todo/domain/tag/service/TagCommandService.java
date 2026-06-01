package revi1337.todo.domain.tag.service;

import revi1337.todo.domain.tag.service.dto.TagResponse;

public interface TagCommandService {

    TagResponse save(String name, String color);

    TagResponse update(Long id, String name, String color);

    void deleteById(Long id);
}
