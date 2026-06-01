package revi1337.todo.domain.todo.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.domain.todo.entity.Priority;
import revi1337.todo.domain.todo.service.dto.ReorderRequest;
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
    private TodoQueryService todoQueryService;
    @Autowired
    private TodoCommandService todoCommandService;
    @Autowired
    private EntityManager entityManager;

    @Test
    @DisplayName("Todo를 생성한다")
    void create() {
        TodoRequest request = new TodoRequest("스프링 공부", "JPA 챕터", Priority.HIGH,
                LocalDate.of(2026, 6, 1), null, null, null);

        TodoResponse result = todoCommandService.create(request);

        assertThat(result.id()).isNotNull();
        assertThat(result.title()).isEqualTo("스프링 공부");
        assertThat(result.priority()).isEqualTo(Priority.HIGH);
        assertThat(result.completed()).isFalse();
        assertThat(result.position()).isEqualTo(0);
    }

    @Test
    @DisplayName("Todo 생성 시 기존 active todos의 position이 +1 밀리고 새 todo는 position 0이 된다")
    void create_shiftsExistingActiveTodosAndInsertsAtTop() {
        TodoResponse first = todoCommandService.create(new TodoRequest("첫번째", null, null, null, null, null, null));
        TodoResponse second = todoCommandService.create(new TodoRequest("두번째", null, null, null, null, null, null));
        TodoResponse third = todoCommandService.create(new TodoRequest("세번째", null, null, null, null, null, null));
        entityManager.clear();

        assertThat(todoQueryService.findById(third.id()).position()).isEqualTo(0);
        assertThat(todoQueryService.findById(second.id()).position()).isEqualTo(1);
        assertThat(todoQueryService.findById(first.id()).position()).isEqualTo(2);
    }

    @Test
    @DisplayName("필터 없이 전체 목록을 조회한다")
    void findAll_noFilter() {
        todoCommandService.create(new TodoRequest("Todo1", null, null, null, null, null, null));
        todoCommandService.create(new TodoRequest("Todo2", null, null, null, null, null, null));

        List<TodoResponse> result = todoQueryService.findAll(new TodoFilterRequest(null, null, null, null, null, null));

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("전체 목록은 position ASC 순으로 반환된다")
    void findAll_orderedByPosition() {
        TodoResponse a = todoCommandService.create(new TodoRequest("A", null, null, null, null, null, null));
        TodoResponse b = todoCommandService.create(new TodoRequest("B", null, null, null, null, null, null));
        TodoResponse c = todoCommandService.create(new TodoRequest("C", null, null, null, null, null, null));

        todoCommandService.reorder(List.of(
                new ReorderRequest.ReorderItem(c.id(), 0),
                new ReorderRequest.ReorderItem(a.id(), 1),
                new ReorderRequest.ReorderItem(b.id(), 2)));

        List<TodoResponse> result = todoQueryService.findAll(new TodoFilterRequest(null, null, null, null, null, null));

        assertThat(result).extracting(TodoResponse::title)
                .containsExactly("C", "A", "B");
    }

    @Test
    @DisplayName("Todo를 완료 처리하면 completedAt이 설정된다")
    void update_complete() {
        TodoResponse created = todoCommandService.create(new TodoRequest("스프링 공부", null, null, null, null, null, null));
        TodoRequest updateRequest = new TodoRequest("스프링 공부", null, null, null, null, null, true);

        TodoResponse result = todoCommandService.update(created.id(), updateRequest);

        assertThat(result.completed()).isTrue();
        assertThat(result.completedAt()).isNotNull();
    }

    @Test
    @DisplayName("Todo를 삭제한다")
    void deleteTodo() {
        TodoResponse created = todoCommandService.create(new TodoRequest("스프링 공부", null, null, null, null, null, null));

        todoCommandService.delete(created.id());

        TodoFilterRequest filter = new TodoFilterRequest(null, null, null, null, null, null);
        assertThat(todoQueryService.findAll(filter)).isEmpty();
    }

    @Test
    @DisplayName("존재하지 않는 Todo 삭제 시 예외를 던진다")
    void delete_notFound_throws() {
        assertThatThrownBy(() -> todoCommandService.delete(999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    @DisplayName("ID로 단건 조회한다")
    void findById() {
        TodoResponse created = todoCommandService.create(new TodoRequest("단건 조회 테스트", null, null, null, null, null, null));

        TodoResponse result = todoQueryService.findById(created.id());

        assertThat(result.id()).isEqualTo(created.id());
        assertThat(result.title()).isEqualTo("단건 조회 테스트");
    }

    @Test
    @DisplayName("존재하지 않는 ID 조회 시 예외를 던진다")
    void findById_notFound_throws() {
        assertThatThrownBy(() -> todoQueryService.findById(999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    @DisplayName("PATCH로 completed true 전환 시 completedAt이 설정된다")
    void patch_completed() {
        TodoResponse created = todoCommandService.create(
                new TodoRequest("패치 테스트", "설명", Priority.HIGH, LocalDate.of(2026, 6, 1), null, null, null));

        todoCommandService.patch(created.id(), new TodoPatchRequest(true));

        TodoResponse result = todoQueryService.findById(created.id());
        assertThat(result.completed()).isTrue();
        assertThat(result.completedAt()).isNotNull();
    }

    @Test
    @DisplayName("completed가 null이면 변경 없이 그대로 유지된다")
    void patch_nullCompleted_noChange() {
        TodoResponse created = todoCommandService.create(new TodoRequest("테스트", null, null, null, null, null, null));

        todoCommandService.patch(created.id(), new TodoPatchRequest(null));

        TodoResponse result = todoQueryService.findById(created.id());
        assertThat(result.completed()).isFalse();
        assertThat(result.completedAt()).isNull();
    }

    @Test
    @DisplayName("존재하지 않는 Todo PATCH 시 예외를 던진다")
    void patch_notFound_throws() {
        assertThatThrownBy(() -> todoCommandService.patch(999L, new TodoPatchRequest(true)))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    @DisplayName("PATCH로 completed true 전환 시 position이 0으로 이동하고 기존 그룹이 당겨진다")
    void patch_completedToggle_movesToPositionZero() {
        TodoResponse a = todoCommandService.create(new TodoRequest("A", null, null, null, null, null, null));
        TodoResponse b = todoCommandService.create(new TodoRequest("B", null, null, null, null, null, null));
        todoCommandService.reorder(List.of(
                new ReorderRequest.ReorderItem(a.id(), 0),
                new ReorderRequest.ReorderItem(b.id(), 1)));

        todoCommandService.patch(a.id(), new TodoPatchRequest(true));

        TodoResponse result = todoQueryService.findById(a.id());
        assertThat(result.completed()).isTrue();
        assertThat(result.position()).isEqualTo(0);

        TodoResponse remaining = todoQueryService.findById(b.id());
        assertThat(remaining.position()).isEqualTo(0);
    }

    @Test
    @DisplayName("PATCH로 completed false 전환 시 position이 0으로 이동하고 기존 active 그룹이 밀린다")
    void patch_completedFalseToggle_movesToPositionZero() {
        TodoResponse active = todoCommandService.create(new TodoRequest("Active", null, null, null, null, null, null));
        todoCommandService.reorder(List.of(new ReorderRequest.ReorderItem(active.id(), 0)));

        TodoResponse completedTodo = todoCommandService.create(new TodoRequest("Completed", null, null, null, null, null, null));
        todoCommandService.patch(completedTodo.id(), new TodoPatchRequest(true));

        todoCommandService.patch(completedTodo.id(), new TodoPatchRequest(false));

        TodoResponse result = todoQueryService.findById(completedTodo.id());
        assertThat(result.completed()).isFalse();
        assertThat(result.position()).isEqualTo(0);

        TodoResponse shifted = todoQueryService.findById(active.id());
        assertThat(shifted.position()).isEqualTo(1);
    }

    @Test
    @DisplayName("reorder로 position을 일괄 변경한다")
    void reorder() {
        TodoResponse a = todoCommandService.create(new TodoRequest("A", null, null, null, null, null, null));
        TodoResponse b = todoCommandService.create(new TodoRequest("B", null, null, null, null, null, null));
        TodoResponse c = todoCommandService.create(new TodoRequest("C", null, null, null, null, null, null));

        todoCommandService.reorder(List.of(
                new ReorderRequest.ReorderItem(a.id(), 2),
                new ReorderRequest.ReorderItem(b.id(), 0),
                new ReorderRequest.ReorderItem(c.id(), 1)));

        assertThat(todoQueryService.findById(a.id()).position()).isEqualTo(2);
        assertThat(todoQueryService.findById(b.id()).position()).isEqualTo(0);
        assertThat(todoQueryService.findById(c.id()).position()).isEqualTo(1);
    }
}
