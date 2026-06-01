package revi1337.todo.domain.todo.repository;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import revi1337.todo.domain.category.entity.Category;
import revi1337.todo.domain.category.repository.CategoryRepository;
import revi1337.todo.domain.tag.entity.Tag;
import revi1337.todo.domain.tag.repository.TagRepository;
import revi1337.todo.domain.todo.entity.Priority;
import revi1337.todo.domain.todo.entity.Todo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace.NONE;
import static revi1337.todo.domain.todo.repository.TodoSpecification.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = NONE)
class TodoRepositoryTest {

    @Autowired private TodoRepository todoRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private TagRepository tagRepository;
    @Autowired private EntityManager entityManager;

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 5, 28, 0, 0);
    private Category category;
    private Tag tag;

    @BeforeEach
    void setUp() {
        category = categoryRepository.save(new Category("개발", "#6366f1", NOW));
        tag = tagRepository.save(new Tag("JPA", "#94a3b8"));
    }

    @Test
    @DisplayName("카테고리로 필터링한다")
    void filterByCategory() {
        todoRepository.save(new Todo("Todo1", null, Priority.HIGH, null, category, null, NOW));
        todoRepository.save(new Todo("Todo2", null, Priority.LOW, null, null, null, NOW));

        List<Todo> result = todoRepository.findAll(Specification.where(hasCategory(category.getId())));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Todo1");
    }

    @Test
    @DisplayName("태그로 필터링한다")
    void filterByTag() {
        todoRepository.save(new Todo("Todo1", null, null, null, null, Set.of(tag), NOW));
        todoRepository.save(new Todo("Todo2", null, null, null, null, null, NOW));

        List<Todo> result = todoRepository.findAll(Specification.where(hasTag(tag.getId())));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Todo1");
    }

    @Test
    @DisplayName("키워드로 제목/설명을 검색한다")
    void filterByKeyword() {
        todoRepository.save(new Todo("스프링 공부", "JPA 챕터", null, null, null, null, NOW));
        todoRepository.save(new Todo("운동하기", null, null, null, null, null, NOW));

        List<Todo> result = todoRepository.findAll(Specification.where(hasKeyword("스프링")));

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("마감일로 필터링한다")
    void filterByDueDate() {
        LocalDate target = LocalDate.of(2026, 6, 1);
        todoRepository.save(new Todo("Todo1", null, null, target, null, null, NOW));
        todoRepository.save(new Todo("Todo2", null, null, LocalDate.of(2026, 6, 2), null, null, NOW));

        List<Todo> result = todoRepository.findAll(Specification.where(hasDueDate(target)));

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("완료 여부로 필터링한다")
    void filterByCompleted() {
        Todo todo = todoRepository.save(new Todo("Todo1", null, null, null, null, null, NOW));
        todo.update("Todo1", null, null, null, null, null, true, NOW.plusHours(1));
        todoRepository.save(new Todo("Todo2", null, null, null, null, null, NOW));

        List<Todo> result = todoRepository.findAll(Specification.where(isCompleted(true)));

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("position으로 정렬해서 조회한다")
    void findAllOrderByPosition() {
        Todo a = todoRepository.save(new Todo("A", null, null, null, null, null, NOW));
        Todo b = todoRepository.save(new Todo("B", null, null, null, null, null, NOW));
        Todo c = todoRepository.save(new Todo("C", null, null, null, null, null, NOW));
        a.updatePosition(2);
        b.updatePosition(0);
        c.updatePosition(1);

        List<Todo> result = todoRepository.findAll(Sort.by(Sort.Direction.ASC, "position"));

        assertThat(result).extracting(Todo::getTitle)
                .containsExactly("B", "C", "A");
    }

    @Test
    @DisplayName("incrementPositions는 해당 그룹 전체 position을 +1 한다")
    void incrementPositions() {
        Todo a = todoRepository.save(new Todo("A", null, null, null, null, null, NOW));
        Todo b = todoRepository.save(new Todo("B", null, null, null, null, null, NOW));
        a.updatePosition(0);
        b.updatePosition(1);
        todoRepository.flush();

        todoRepository.incrementPositionsNullDueDate(false);
        todoRepository.flush();
        entityManager.clear();

        assertThat(todoRepository.findById(a.getId()).get().getPosition()).isEqualTo(1);
        assertThat(todoRepository.findById(b.getId()).get().getPosition()).isEqualTo(2);
    }

    @Test
    @DisplayName("decrementPositionsAfter는 지정 position 이후만 -1 한다")
    void decrementPositionsAfter() {
        Todo a = todoRepository.save(new Todo("A", null, null, null, null, null, NOW));
        Todo b = todoRepository.save(new Todo("B", null, null, null, null, null, NOW));
        Todo c = todoRepository.save(new Todo("C", null, null, null, null, null, NOW));
        a.updatePosition(0);
        b.updatePosition(1);
        c.updatePosition(2);
        todoRepository.flush();

        todoRepository.decrementPositionsAfterNullDueDate(false, 0);
        todoRepository.flush();
        entityManager.clear();

        assertThat(todoRepository.findById(a.getId()).get().getPosition()).isEqualTo(0);
        assertThat(todoRepository.findById(b.getId()).get().getPosition()).isEqualTo(0);
        assertThat(todoRepository.findById(c.getId()).get().getPosition()).isEqualTo(1);
    }

    @Test
    @Disabled("PostgreSQL unnest 전용 — H2에서 실행 불가")
    @DisplayName("bulkUpdatePositions는 단일 쿼리로 여러 todo의 position을 갱신한다")
    void bulkUpdatePositions() {
        Todo a = todoRepository.save(new Todo("A", null, null, null, null, null, NOW));
        Todo b = todoRepository.save(new Todo("B", null, null, null, null, null, NOW));
        Todo c = todoRepository.save(new Todo("C", null, null, null, null, null, NOW));
        todoRepository.flush();

        todoRepository.bulkUpdatePositions(
                new Long[]{a.getId(), b.getId(), c.getId()},
                new int[]{2, 0, 1}
        );

        assertThat(todoRepository.findById(a.getId()).get().getPosition()).isEqualTo(2);
        assertThat(todoRepository.findById(b.getId()).get().getPosition()).isEqualTo(0);
        assertThat(todoRepository.findById(c.getId()).get().getPosition()).isEqualTo(1);
    }
}
