package revi1337.todo.domain.category.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNullPointerException;

class CategoryTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 5, 28, 0, 0);

    @Test
    @DisplayName("정상적인 값으로 Category를 생성한다")
    void create_success() {
        Category category = new Category("개발", "#6366f1", NOW);

        assertThat(category.getName()).isEqualTo("개발");
        assertThat(category.getColor()).isEqualTo("#6366f1");
        assertThat(category.getCreatedAt()).isEqualTo(NOW);
    }

    @Test
    @DisplayName("name이 null이면 NPE를 던진다")
    void create_nullName_throwsNPE() {
        assertThatNullPointerException()
                .isThrownBy(() -> new Category(null, "#6366f1", NOW))
                .withMessage("name must not be null");
    }

    @Test
    @DisplayName("color가 null이면 NPE를 던진다")
    void create_nullColor_throwsNPE() {
        assertThatNullPointerException()
                .isThrownBy(() -> new Category("개발", null, NOW))
                .withMessage("color must not be null");
    }

    @Test
    @DisplayName("createdAt이 null이면 NPE를 던진다")
    void create_nullCreatedAt_throwsNPE() {
        assertThatNullPointerException()
                .isThrownBy(() -> new Category("개발", "#6366f1", null))
                .withMessage("createdAt must not be null");
    }
}
