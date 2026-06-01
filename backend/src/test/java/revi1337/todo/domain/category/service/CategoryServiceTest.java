package revi1337.todo.domain.category.service;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.domain.category.service.dto.CategoryResponse;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class CategoryServiceTest {

    @Autowired
    private CategoryQueryService categoryQueryService;
    @Autowired
    private CategoryCommandService categoryCommandService;

    @Test
    @DisplayName("name과 color로 Category를 저장한다")
    void save() {
        CategoryResponse result = categoryCommandService.save("개발", "#6366f1");

        assertThat(result.id()).isNotNull();
        assertThat(result.name()).isEqualTo("개발");
        assertThat(result.color()).isEqualTo("#6366f1");
        assertThat(result.createdAt()).isNotNull();
    }

    @Test
    @DisplayName("전체 Category 목록을 반환한다")
    void findAll() {
        categoryCommandService.save("개발", "#6366f1");
        categoryCommandService.save("운동", "#f59e0b");

        List<CategoryResponse> result = categoryQueryService.findAll();

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Category의 name과 color를 수정한다")
    void update() {
        CategoryResponse saved = categoryCommandService.save("개발", "#6366f1");

        CategoryResponse result = categoryCommandService.update(saved.id(), "업무", "#f59e0b");

        assertThat(result.name()).isEqualTo("업무");
        assertThat(result.color()).isEqualTo("#f59e0b");
    }

    @Test
    @DisplayName("존재하지 않는 Category 수정 시 예외를 던진다")
    void update_notFound_throws() {
        assertThatThrownBy(() -> categoryCommandService.update(999L, "업무", "#f59e0b"))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    @DisplayName("ID로 Category를 삭제하면 조회되지 않는다")
    void deleteById() {
        CategoryResponse saved = categoryCommandService.save("개발", "#6366f1");

        categoryCommandService.deleteById(saved.id());

        assertThat(categoryQueryService.findAll()).isEmpty();
    }
}
