package revi1337.todo.domain.category.service;

import revi1337.todo.domain.category.service.dto.CategoryResponse;

import java.util.List;

public interface CategoryQueryService {

    List<CategoryResponse> findAll();
}
