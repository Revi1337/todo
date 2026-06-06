package revi1337.todo.domain.todo.repository;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.domain.tag.entity.Tag;
import revi1337.todo.domain.tag.repository.TagRepository;
import revi1337.todo.domain.todo.entity.Priority;
import revi1337.todo.domain.todo.entity.Todo;
import revi1337.todo.domain.todo.entity.TodoTag;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class TodoTagJdbcRepositoryTest {

    @Autowired private TodoRepository todoRepository;
    @Autowired private TodoTagRepository todoTagRepository;
    @Autowired private TodoTagJdbcRepository todoTagJdbcRepository;
    @Autowired private TagRepository tagRepository;
    @Autowired private EntityManager entityManager;

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 6, 1, 0, 0);

    private Tag tagA;
    private Tag tagB;
    private Todo todo;

    @BeforeEach
    void setUp() {
        tagA = tagRepository.save(new Tag("tagA"));
        tagB = tagRepository.save(new Tag("tagB"));
        todo = todoRepository.save(new Todo("Todo", null, Priority.MEDIUM, null, null, null, NOW));
        entityManager.flush();
        entityManager.clear();
    }

    @Test
    @DisplayName("bulkInsert — 여러 tagId를 한번에 삽입 후 DB에 반영된다")
    void bulkInsert_insertsAllTags() {
        todoTagJdbcRepository.bulkInsert(todo.getId(), List.of(tagA.getId(), tagB.getId()));
        entityManager.flush();
        entityManager.clear();

        List<TodoTag> result = todoTagRepository.findAll();
        assertThat(result).hasSize(2);
        assertThat(result).extracting(tt -> tt.getTodo().getId())
                .containsOnly(todo.getId());
    }

    @Test
    @DisplayName("bulkInsert — 빈 tagId 목록으로 실행하면 DB에 반영되지 않는다")
    void bulkInsert_emptyList_insertsNothing() {
        todoTagJdbcRepository.bulkInsert(todo.getId(), List.of());
        entityManager.flush();
        entityManager.clear();

        assertThat(todoTagRepository.findAll()).isEmpty();
    }
}
