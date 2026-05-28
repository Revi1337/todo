package revi1337.todo.domain.todo.service;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.domain.todo.entity.Priority;
import revi1337.todo.domain.todo.entity.Todo;
import revi1337.todo.domain.todo.service.dto.TodoFilterRequest;
import revi1337.todo.domain.todo.service.dto.TodoRequest;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TodoServiceTest {

    @Autowired
    private TodoService todoService;

    @Test
    @DisplayName("Todo를 생성한다")
    void create() {
        TodoRequest request = new TodoRequest("스프링 공부", "JPA 챕터", Priority.HIGH,
                LocalDate.of(2026, 6, 1), null, null, null);

        Todo result = todoService.create(request);

        assertThat(result.getId()).isNotNull();
        assertThat(result.getTitle()).isEqualTo("스프링 공부");
        assertThat(result.getPriority()).isEqualTo(Priority.HIGH);
        assertThat(result.isCompleted()).isFalse();
    }

    @Test
    @DisplayName("필터 없이 전체 목록을 조회한다")
    void findAll_noFilter() {
        todoService.create(new TodoRequest("Todo1", null, null, null, null, null, null));
        todoService.create(new TodoRequest("Todo2", null, null, null, null, null, null));

        List<Todo> result = todoService.findAll(new TodoFilterRequest(null, null, null, null, null, null));

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Todo를 완료 처리하면 completedAt이 설정된다")
    void update_complete() {
        Todo created = todoService.create(new TodoRequest("스프링 공부", null, null, null, null, null, null));
        TodoRequest updateRequest = new TodoRequest("스프링 공부", null, null, null, null, null, true);

        Todo result = todoService.update(created.getId(), updateRequest);

        assertThat(result.isCompleted()).isTrue();
        assertThat(result.getCompletedAt()).isNotNull();
    }

    @Test
    @DisplayName("Todo를 삭제한다")
    void deleteTodo() {
        Todo created = todoService.create(new TodoRequest("스프링 공부", null, null, null, null, null, null));

        todoService.delete(created.getId());

        TodoFilterRequest filter = new TodoFilterRequest(null, null, null, null, null, null);
        assertThat(todoService.findAll(filter)).isEmpty();
    }

    @Test
    @DisplayName("존재하지 않는 Todo 삭제 시 예외를 던진다")
    void delete_notFound_throws() {
        assertThatThrownBy(() -> todoService.delete(999L))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
