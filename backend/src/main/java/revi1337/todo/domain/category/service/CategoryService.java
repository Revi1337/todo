package revi1337.todo.domain.category.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.domain.category.entity.Category;
import revi1337.todo.domain.category.repository.CategoryRepository;
import revi1337.todo.domain.category.service.dto.CategoryResponse;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional
    public CategoryResponse save(String name, String color) {
        try {
            return CategoryResponse.from(categoryRepository.save(new Category(name, color, LocalDateTime.now())));
        } catch (RuntimeException e) {
            log.error("카테고리 생성 중 오류가 발생했습니다. name: {}", name, e);
            throw e;
        }
    }

    public List<CategoryResponse> findAll() {
        try {
            return categoryRepository.findAll().stream()
                    .map(CategoryResponse::from)
                    .toList();
        } catch (RuntimeException e) {
            log.error("카테고리 목록 조회 중 오류가 발생했습니다", e);
            throw e;
        }
    }

    @Transactional
    public CategoryResponse update(Long id, String name, String color) {
        try {
            Category category = categoryRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Category not found: " + id));
            category.update(name, color);
            return CategoryResponse.from(category);
        } catch (RuntimeException e) {
            log.error("카테고리 수정 중 오류가 발생했습니다. id: {}", id, e);
            throw e;
        }
    }

    @Transactional
    public void deleteById(Long id) {
        try {
            categoryRepository.deleteById(id);
        } catch (RuntimeException e) {
            log.error("카테고리 삭제 중 오류가 발생했습니다. id: {}", id, e);
            throw e;
        }
    }
}
