package revi1337.todo.domain.category.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import revi1337.todo.common.ApiResponse;
import revi1337.todo.domain.category.service.CategoryCommandService;
import revi1337.todo.domain.category.service.CategoryQueryService;
import revi1337.todo.domain.category.service.dto.CategoryCreateRequest;
import revi1337.todo.domain.category.service.dto.CategoryResponse;
import revi1337.todo.domain.category.service.dto.CategoryUpdateRequest;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryQueryService categoryQueryService;
    private final CategoryCommandService categoryCommandService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CategoryResponse> create(@RequestBody @Valid CategoryCreateRequest request) {
        return ApiResponse.ok(categoryCommandService.save(request.name(), request.color()));
    }

    @GetMapping
    public ApiResponse<List<CategoryResponse>> findAll() {
        return ApiResponse.ok(categoryQueryService.findAll());
    }

    @PutMapping("/{id}")
    public ApiResponse<CategoryResponse> update(@PathVariable Long id, @RequestBody @Valid CategoryUpdateRequest request) {
        return ApiResponse.ok(categoryCommandService.update(id, request.name(), request.color()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        categoryCommandService.deleteById(id);
    }
}
