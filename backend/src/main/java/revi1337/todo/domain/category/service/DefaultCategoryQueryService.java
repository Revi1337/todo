package revi1337.todo.domain.category.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import revi1337.todo.domain.category.repository.CategoryRepository;
import revi1337.todo.domain.category.service.dto.CategoryResponse;

@Slf4j
@Service
@RequiredArgsConstructor
public class DefaultCategoryQueryService implements CategoryQueryService {

    private final CategoryRepository categoryRepository;

    @Override
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
}
