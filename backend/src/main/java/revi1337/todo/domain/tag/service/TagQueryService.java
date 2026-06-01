package revi1337.todo.domain.tag.service;

import revi1337.todo.domain.tag.service.dto.TagResponse;

import java.util.List;

public interface TagQueryService {

    List<TagResponse> findAll();
}
