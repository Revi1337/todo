package revi1337.todo.domain.todo.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNullPointerException;

class TodoTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 5, 28, 0, 0);

    @Test
    @DisplayName("정상적인 값으로 Todo를 생성한다")
    void create_success() {
        Todo todo = new Todo("스프링 공부", "JPA 챕터", Priority.HIGH, LocalDate.of(2026, 6, 1), null, null, NOW);

        assertThat(todo.getTitle()).isEqualTo("스프링 공부");
        assertThat(todo.getPriority()).isEqualTo(Priority.HIGH);
        assertThat(todo.isCompleted()).isFalse();
        assertThat(todo.getCreatedAt()).isEqualTo(NOW);
        assertThat(todo.getUpdatedAt()).isEqualTo(NOW);
        assertThat(todo.getCompletedAt()).isNull();
    }

    @Test
    @DisplayName("priority가 null이면 MEDIUM이 기본값이다")
    void create_nullPriority_defaultsMedium() {
        Todo todo = new Todo("스프링 공부", null, null, null, null, null, NOW);

        assertThat(todo.getPriority()).isEqualTo(Priority.MEDIUM);
    }

    @Test
    @DisplayName("title이 null이면 NPE를 던진다")
    void create_nullTitle_throwsNPE() {
        assertThatNullPointerException()
                .isThrownBy(() -> new Todo(null, null, null, null, null, null, NOW))
                .withMessage("title must not be null");
    }

    @Test
    @DisplayName("완료 처리 시 completedAt이 설정된다")
    void update_complete_setsCompletedAt() {
        Todo todo = new Todo("스프링 공부", null, null, null, null, null, NOW);
        LocalDateTime completeTime = NOW.plusHours(1);

        todo.update("스프링 공부", null, null, null, null, null, true, completeTime);

        assertThat(todo.isCompleted()).isTrue();
        assertThat(todo.getCompletedAt()).isEqualTo(completeTime);
    }

    @Test
    @DisplayName("완료 취소 시 completedAt이 null이 된다")
    void update_uncomplete_clearsCompletedAt() {
        Todo todo = new Todo("스프링 공부", null, null, null, null, null, NOW);
        todo.update("스프링 공부", null, null, null, null, null, true, NOW.plusHours(1));

        todo.update("스프링 공부", null, null, null, null, null, false, NOW.plusHours(2));

        assertThat(todo.isCompleted()).isFalse();
        assertThat(todo.getCompletedAt()).isNull();
    }
}
