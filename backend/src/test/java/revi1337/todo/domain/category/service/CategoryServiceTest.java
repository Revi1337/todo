package revi1337.todo.domain.category.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.domain.category.entity.Category;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CategoryServiceTest {

    @Autowired
    private CategoryService categoryService;

    @Test
    @DisplayName("name과 color로 Category를 저장한다")
    void save() {
        Category result = categoryService.save("개발", "#6366f1");

        assertThat(result.getId()).isNotNull();
        assertThat(result.getName()).isEqualTo("개발");
        assertThat(result.getColor()).isEqualTo("#6366f1");
        assertThat(result.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("전체 Category 목록을 반환한다")
    void findAll() {
        categoryService.save("개발", "#6366f1");
        categoryService.save("운동", "#f59e0b");

        List<Category> result = categoryService.findAll();

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("ID로 Category를 삭제하면 조회되지 않는다")
    void deleteById() {
        Category saved = categoryService.save("개발", "#6366f1");

        categoryService.deleteById(saved.getId());

        assertThat(categoryService.findAll()).isEmpty();
    }
}
