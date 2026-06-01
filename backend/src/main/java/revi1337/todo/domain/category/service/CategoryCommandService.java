package revi1337.todo.domain.category.service;

import revi1337.todo.domain.category.service.dto.CategoryResponse;

public interface CategoryCommandService {

    CategoryResponse save(String name, String color);

    CategoryResponse update(Long id, String name, String color);

    void deleteById(Long id);
}
