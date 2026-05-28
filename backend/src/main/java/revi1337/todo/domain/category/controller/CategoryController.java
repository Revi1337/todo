package revi1337.todo.domain.category.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import revi1337.todo.common.ApiResponse;
import revi1337.todo.domain.category.service.dto.CategoryCreateRequest;
import revi1337.todo.domain.category.service.dto.CategoryResponse;
import revi1337.todo.domain.category.service.CategoryService;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CategoryResponse> create(@RequestBody @Valid CategoryCreateRequest request) {
        return ApiResponse.ok(categoryService.save(request.name(), request.color()));
    }

    @GetMapping
    public ApiResponse<List<CategoryResponse>> findAll() {
        return ApiResponse.ok(categoryService.findAll());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        categoryService.deleteById(id);
    }
}
