package revi1337.todo.domain.todo.repository;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import revi1337.todo.domain.tag.entity.Tag;
import revi1337.todo.domain.tag.repository.TagRepository;
import revi1337.todo.domain.todo.entity.Priority;
import revi1337.todo.domain.todo.entity.Todo;
import revi1337.todo.domain.todo.entity.TodoTag;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace.NONE;

@DataJpaTest
@AutoConfigureTestDatabase(replace = NONE)
class TodoTagRepositoryTest {

    @Autowired private TodoRepository todoRepository;
    @Autowired private TodoTagRepository todoTagRepository;
    @Autowired private TagRepository tagRepository;
    @Autowired private EntityManager entityManager;

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 6, 1, 0, 0);

    private Tag tagA;
    private Tag tagB;
    private Todo todo1;
    private Todo todo2;

    @BeforeEach
    void setUp() {
        tagA = tagRepository.save(new Tag("tagA"));
        tagB = tagRepository.save(new Tag("tagB"));
        todo1 = todoRepository.save(new Todo("Todo1", null, Priority.MEDIUM, null, null, Set.of(tagA, tagB), NOW));
        todo2 = todoRepository.save(new Todo("Todo2", null, Priority.MEDIUM, null, null, Set.of(tagA), NOW));
        entityManager.flush();
        entityManager.clear();
    }

    @Test
    @DisplayName("deleteAllByTodoId — 해당 todo의 태그만 삭제되고 다른 todo의 태그는 유지된다")
    void deleteAllByTodoId_onlyDeletesTargetTodoTags() {
        todoTagRepository.deleteAllByTodoId(todo1.getId());
        entityManager.flush();
        entityManager.clear();

        List<TodoTag> remaining = todoTagRepository.findAll();
        assertThat(remaining).hasSize(1);
        assertThat(remaining.get(0).getTodo().getId()).isEqualTo(todo2.getId());
    }

    @Test
    @DisplayName("deleteAllByTodoId — 태그가 없는 todo에 실행해도 예외가 발생하지 않는다")
    void deleteAllByTodoId_noTags_doesNotThrow() {
        Todo emptyTodo = todoRepository.save(new Todo("Empty", null, Priority.LOW, null, null, null, NOW));
        entityManager.flush();

        todoTagRepository.deleteAllByTodoId(emptyTodo.getId());
    }
}
