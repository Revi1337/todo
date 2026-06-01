package revi1337.todo.domain.category.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import revi1337.todo.domain.category.service.dto.CategoryResponse;

import java.util.List;

@Slf4j
@Primary
@Service
public class LoggingCategoryService implements CategoryQueryService, CategoryCommandService {

    private final CategoryQueryService queryDelegate;
    private final CategoryCommandService commandDelegate;

    public LoggingCategoryService(
            @Qualifier("defaultCategoryQueryService") CategoryQueryService queryDelegate,
            @Qualifier("defaultCategoryCommandService") CategoryCommandService commandDelegate) {
        this.queryDelegate = queryDelegate;
        this.commandDelegate = commandDelegate;
    }

    @Override
    public List<CategoryResponse> findAll() {
        try {
            return queryDelegate.findAll();
        } catch (RuntimeException e) {
            log.error("카테고리 목록 조회 중 오류가 발생했습니다", e);
            throw e;
        }
    }

    @Override
    public CategoryResponse save(String name, String color) {
        try {
            return commandDelegate.save(name, color);
        } catch (RuntimeException e) {
            log.error("카테고리 생성 중 오류가 발생했습니다. name: {}", name, e);
            throw e;
        }
    }

    @Override
    public CategoryResponse update(Long id, String name, String color) {
        try {
            return commandDelegate.update(id, name, color);
        } catch (RuntimeException e) {
            log.error("카테고리 수정 중 오류가 발생했습니다. id: {}", id, e);
            throw e;
        }
    }

    @Override
    public void deleteById(Long id) {
        try {
            commandDelegate.deleteById(id);
        } catch (RuntimeException e) {
            log.error("카테고리 삭제 중 오류가 발생했습니다. id: {}", id, e);
            throw e;
        }
    }
}
