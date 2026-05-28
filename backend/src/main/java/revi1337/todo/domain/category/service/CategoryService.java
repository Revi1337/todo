package revi1337.todo.domain.category.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.domain.category.entity.Category;
import revi1337.todo.domain.category.repository.CategoryRepository;
import revi1337.todo.domain.category.service.dto.CategoryResponse;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional
    public CategoryResponse save(String name, String color) {
        return CategoryResponse.from(categoryRepository.save(new Category(name, color, LocalDateTime.now())));
    }

    public List<CategoryResponse> findAll() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional
    public void deleteById(Long id) {
        categoryRepository.deleteById(id);
    }
}
