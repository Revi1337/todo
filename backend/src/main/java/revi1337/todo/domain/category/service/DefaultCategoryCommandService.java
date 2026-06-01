package revi1337.todo.domain.category.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.domain.category.entity.Category;
import revi1337.todo.domain.category.repository.CategoryRepository;
import revi1337.todo.domain.category.service.dto.CategoryResponse;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class DefaultCategoryCommandService implements CategoryCommandService {

    private final CategoryRepository categoryRepository;

    @Override
    public CategoryResponse save(String name, String color) {
        return CategoryResponse.from(categoryRepository.save(new Category(name, color, LocalDateTime.now())));
    }

    @Override
    public CategoryResponse update(Long id, String name, String color) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + id));
        category.update(name, color);
        return CategoryResponse.from(category);
    }

    @Override
    public void deleteById(Long id) {
        categoryRepository.deleteById(id);
    }
}
