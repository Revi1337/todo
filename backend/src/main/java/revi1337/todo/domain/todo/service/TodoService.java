package revi1337.todo.domain.todo.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ObjectUtils;
import revi1337.todo.domain.category.entity.Category;
import revi1337.todo.domain.category.repository.CategoryRepository;
import revi1337.todo.domain.tag.entity.Tag;
import revi1337.todo.domain.tag.repository.TagRepository;
import revi1337.todo.domain.todo.entity.Todo;
import revi1337.todo.domain.todo.repository.TodoJdbcRepository;
import revi1337.todo.domain.todo.repository.TodoRepository;
import revi1337.todo.domain.todo.repository.TodoSpecification;
import revi1337.todo.domain.todo.service.dto.ReorderRequest;
import revi1337.todo.domain.todo.service.dto.TodoFilterRequest;
import revi1337.todo.domain.todo.service.dto.TodoPatchRequest;
import revi1337.todo.domain.todo.service.dto.TodoRequest;
import revi1337.todo.domain.todo.service.dto.TodoResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
public class TodoService {

    private final TodoRepository todoRepository;
    private final TodoJdbcRepository todoJdbcRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final EntityManager entityManager;

    public TodoService(TodoRepository todoRepository, TodoJdbcRepository todoJdbcRepository,
            CategoryRepository categoryRepository, TagRepository tagRepository,
            EntityManager entityManager) {
        this.todoRepository = todoRepository;
        this.todoJdbcRepository = todoJdbcRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.entityManager = entityManager;
    }

    @Transactional
    public TodoResponse create(TodoRequest request) {
        try {
            Category category = resolveCategory(request.categoryId());
            Set<Tag> tags = resolveTags(request.tagIds());
            incrementPositions(false, request.dueDate());
            Todo todo = todoRepository.save(new Todo(
                    request.title(), request.description(), request.priority(),
                    request.dueDate(), category, tags, LocalDateTime.now()));
            return TodoResponse.from(todo);
        } catch (RuntimeException e) {
            log.error("Todo 생성 중 오류가 발생했습니다. title: {}", request.title(), e);
            throw e;
        }
    }

    public List<TodoResponse> findAll(TodoFilterRequest filter) {
        try {
            Specification<Todo> spec = TodoSpecification.hasCategory(filter.category())
                    .and(TodoSpecification.hasTag(filter.tag()))
                    .and(TodoSpecification.hasPriority(filter.priority()))
                    .and(TodoSpecification.isCompleted(filter.completed()))
                    .and(TodoSpecification.hasKeyword(filter.search()))
                    .and(TodoSpecification.hasDueDate(filter.dueDate()));

            return todoRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "position")).stream()
                    .map(TodoResponse::from)
                    .toList();
        } catch (RuntimeException e) {
            log.error("Todo 목록 조회 중 오류가 발생했습니다. filter: {}", filter, e);
            throw e;
        }
    }

    @Transactional
    public TodoResponse update(Long id, TodoRequest request) {
        try {
            Todo todo = todoRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Todo not found: " + id));
            Category category = resolveCategory(request.categoryId());
            Set<Tag> tags = resolveTags(request.tagIds());
            boolean completed = request.completed() != null && request.completed();
            todo.update(request.title(), request.description(), request.priority(),
                    request.dueDate(), category, tags, completed, LocalDateTime.now());
            return TodoResponse.from(todo);
        } catch (RuntimeException e) {
            log.error("Todo 수정 중 오류가 발생했습니다. id: {}", id, e);
            throw e;
        }
    }

    public TodoResponse findById(Long id) {
        try {
            return todoRepository.findById(id)
                    .map(TodoResponse::from)
                    .orElseThrow(() -> new EntityNotFoundException("Todo not found: " + id));
        } catch (RuntimeException e) {
            log.error("Todo 단건 조회 중 오류가 발생했습니다. id: {}", id, e);
            throw e;
        }
    }

    @Transactional
    public void patch(Long id, TodoPatchRequest request) {
        try {
            Todo todo = todoRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Todo not found: " + id));

            if (request.completed() == null || request.completed() == todo.isCompleted()) {
                return;
            }

            boolean newCompleted = request.completed();
            int oldPosition = todo.getPosition();
            LocalDate dueDate = todo.getDueDate();
            incrementPositions(newCompleted, dueDate);
            decrementPositionsAfter(!newCompleted, oldPosition, dueDate);
            todo.toggleCompleted(newCompleted, LocalDateTime.now());
            todo.updatePosition(0);
        } catch (RuntimeException e) {
            log.error("Todo 상태 변경 중 오류가 발생했습니다. id: {}", id, e);
            throw e;
        }
    }

    @Transactional
    public void reorder(List<ReorderRequest.ReorderItem> items) {
        try {
            Map<Long, Integer> positionById = items.stream()
                    .collect(Collectors.toMap(ReorderRequest.ReorderItem::id, ReorderRequest.ReorderItem::position));

            List<Todo> todos = todoRepository.findAllById(positionById.keySet());
            if (todos.size() != items.size()) {
                throw new EntityNotFoundException("일부 Todo를 찾을 수 없습니다");
            }

            todoJdbcRepository.bulkUpdatePositions(items);
            entityManager.clear();
        } catch (RuntimeException e) {
            log.error("Todo 순서 변경 중 오류가 발생했습니다. items: {}", items, e);
            throw e;
        }
    }

    @Transactional
    public void delete(Long id) {
        try {
            if (todoRepository.deleteByIdReturningCount(id) == 0) {
                throw new EntityNotFoundException("Todo not found: " + id);
            }
        } catch (RuntimeException e) {
            log.error("Todo 삭제 중 오류가 발생했습니다. id: {}", id, e);
            throw e;
        }
    }

    private void incrementPositions(boolean completed, LocalDate dueDate) {
        if (dueDate != null) {
            todoRepository.incrementPositions(completed, dueDate);
        } else {
            todoRepository.incrementPositionsNullDueDate(completed);
        }
    }

    private void decrementPositionsAfter(boolean completed, int afterPosition, LocalDate dueDate) {
        if (dueDate != null) {
            todoRepository.decrementPositionsAfter(completed, afterPosition, dueDate);
        } else {
            todoRepository.decrementPositionsAfterNullDueDate(completed, afterPosition);
        }
    }

    private Category resolveCategory(Long categoryId) {
        if (ObjectUtils.isEmpty(categoryId)) {
            return null;
        }
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> {
                    log.error("카테고리를 찾을 수 없습니다. categoryId: {}", categoryId);
                    return new EntityNotFoundException("Category not found: " + categoryId);
                });
    }

    private Set<Tag> resolveTags(List<Long> tagIds) {
        if (ObjectUtils.isEmpty(tagIds)) {
            return new HashSet<>();
        }
        try {
            return new HashSet<>(tagRepository.findAllById(tagIds));
        } catch (RuntimeException e) {
            log.error("태그 조회 중 오류가 발생했습니다. tagIds: {}", tagIds, e);
            throw e;
        }
    }
}
