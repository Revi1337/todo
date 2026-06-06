package revi1337.todo.domain.tag.service;

import revi1337.todo.domain.tag.service.dto.TagResponse;

public interface TagCommandService {

    TagResponse save(String name);

    TagResponse update(Long id, String name);

    void deleteById(Long id);
}
