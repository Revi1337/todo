package revi1337.todo.domain.category.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import revi1337.todo.domain.category.entity.Category;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace.NONE;

@DataJpaTest
@AutoConfigureTestDatabase(replace = NONE)
class CategoryRepositoryTest {

    @Autowired
    private CategoryRepository categoryRepository;

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 5, 28, 0, 0);

    @Test
    @DisplayName("Category를 저장하고 ID로 조회한다")
    void save_and_findById() {
        Category saved = categoryRepository.save(new Category("개발", "#6366f1", NOW));

        Optional<Category> found = categoryRepository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("개발");
        assertThat(found.get().getColor()).isEqualTo("#6366f1");
    }

    @Test
    @DisplayName("전체 Category 목록을 조회한다")
    void findAll() {
        categoryRepository.save(new Category("개발", "#6366f1", NOW));
        categoryRepository.save(new Category("운동", "#f59e0b", NOW));

        List<Category> categories = categoryRepository.findAll();

        assertThat(categories).hasSize(2);
    }

    @Test
    @DisplayName("Category를 삭제하면 조회되지 않는다")
    void delete() {
        Category saved = categoryRepository.save(new Category("개발", "#6366f1", NOW));

        categoryRepository.deleteById(saved.getId());

        assertThat(categoryRepository.findById(saved.getId())).isEmpty();
    }
}
