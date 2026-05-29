package revi1337.todo.domain.todo.service;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.domain.todo.entity.Priority;
import revi1337.todo.domain.todo.service.dto.TodoFilterRequest;
import revi1337.todo.domain.todo.service.dto.TodoPatchRequest;
import revi1337.todo.domain.todo.service.dto.TodoRequest;
import revi1337.todo.domain.todo.service.dto.TodoResponse;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class TodoServiceTest {

    @Autowired
    private TodoService todoService;

    @Test
    @DisplayName("Todo를 생성한다")
    void create() {
        TodoRequest request = new TodoRequest("스프링 공부", "JPA 챕터", Priority.HIGH,
                LocalDate.of(2026, 6, 1), null, null, null);

        TodoResponse result = todoService.create(request);

        assertThat(result.id()).isNotNull();
        assertThat(result.title()).isEqualTo("스프링 공부");
        assertThat(result.priority()).isEqualTo(Priority.HIGH);
        assertThat(result.completed()).isFalse();
    }

    @Test
    @DisplayName("필터 없이 전체 목록을 조회한다")
    void findAll_noFilter() {
        todoService.create(new TodoRequest("Todo1", null, null, null, null, null, null));
        todoService.create(new TodoRequest("Todo2", null, null, null, null, null, null));

        List<TodoResponse> result = todoService.findAll(new TodoFilterRequest(null, null, null, null, null, null));

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Todo를 완료 처리하면 completedAt이 설정된다")
    void update_complete() {
        TodoResponse created = todoService.create(new TodoRequest("스프링 공부", null, null, null, null, null, null));
        TodoRequest updateRequest = new TodoRequest("스프링 공부", null, null, null, null, null, true);

        TodoResponse result = todoService.update(created.id(), updateRequest);

        assertThat(result.completed()).isTrue();
        assertThat(result.completedAt()).isNotNull();
    }

    @Test
    @DisplayName("Todo를 삭제한다")
    void deleteTodo() {
        TodoResponse created = todoService.create(new TodoRequest("스프링 공부", null, null, null, null, null, null));

        todoService.delete(created.id());

        TodoFilterRequest filter = new TodoFilterRequest(null, null, null, null, null, null);
        assertThat(todoService.findAll(filter)).isEmpty();
    }

    @Test
    @DisplayName("존재하지 않는 Todo 삭제 시 예외를 던진다")
    void delete_notFound_throws() {
        assertThatThrownBy(() -> todoService.delete(999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    @DisplayName("ID로 단건 조회한다")
    void findById() {
        TodoResponse created = todoService.create(new TodoRequest("단건 조회 테스트", null, null, null, null, null, null));

        TodoResponse result = todoService.findById(created.id());

        assertThat(result.id()).isEqualTo(created.id());
        assertThat(result.title()).isEqualTo("단건 조회 테스트");
    }

    @Test
    @DisplayName("존재하지 않는 ID 조회 시 예외를 던진다")
    void findById_notFound_throws() {
        assertThatThrownBy(() -> todoService.findById(999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    @DisplayName("PATCH로 completed만 변경하면 나머지 필드는 유지된다")
    void patch_onlyCompleted() {
        TodoResponse created = todoService.create(
                new TodoRequest("패치 테스트", "설명", Priority.HIGH, LocalDate.of(2026, 6, 1), null, null, null));

        TodoResponse result = todoService.patch(created.id(),
                new TodoPatchRequest(null, null, null, null, null, null, true));

        assertThat(result.completed()).isTrue();
        assertThat(result.completedAt()).isNotNull();
        assertThat(result.title()).isEqualTo("패치 테스트");
        assertThat(result.priority()).isEqualTo(Priority.HIGH);
    }

    @Test
    @DisplayName("PATCH로 title만 변경하면 completed는 유지된다")
    void patch_onlyTitle() {
        TodoResponse created = todoService.create(
                new TodoRequest("원래 제목", null, null, null, null, null, null));

        TodoResponse result = todoService.patch(created.id(),
                new TodoPatchRequest("새 제목", null, null, null, null, null, null));

        assertThat(result.title()).isEqualTo("새 제목");
        assertThat(result.completed()).isFalse();
    }

    @Test
    @DisplayName("존재하지 않는 Todo PATCH 시 예외를 던진다")
    void patch_notFound_throws() {
        assertThatThrownBy(() -> todoService.patch(999L,
                new TodoPatchRequest(null, null, null, null, null, null, true)))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
