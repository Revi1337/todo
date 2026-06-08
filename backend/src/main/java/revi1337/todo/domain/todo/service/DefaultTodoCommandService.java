package revi1337.todo.domain.todo.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ObjectUtils;
import revi1337.todo.domain.category.entity.Category;
import revi1337.todo.domain.category.repository.CategoryRepository;
import revi1337.todo.domain.tag.entity.Tag;
import revi1337.todo.domain.tag.service.TagResolver;
import revi1337.todo.domain.todo.entity.Todo;
import revi1337.todo.domain.todo.repository.TodoJdbcRepository;
import revi1337.todo.domain.todo.repository.TodoRepository;
import revi1337.todo.domain.todo.repository.TodoTagJdbcRepository;
import revi1337.todo.domain.todo.repository.TodoTagRepository;
import revi1337.todo.domain.todo.service.dto.ReorderRequest;
import revi1337.todo.domain.todo.service.dto.TodoPatchRequest;
import revi1337.todo.domain.todo.service.dto.TodoRequest;
import revi1337.todo.domain.todo.service.dto.TodoResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class DefaultTodoCommandService implements TodoCommandService {

    private final TodoRepository todoRepository;
    private final TodoJdbcRepository todoJdbcRepository;
    private final TodoTagRepository todoTagRepository;
    private final TodoTagJdbcRepository todoTagJdbcRepository;
    private final CategoryRepository categoryRepository;
    private final TagResolver tagResolver;

    @Override
    public TodoResponse create(TodoRequest request) {
        Category category = resolveCategory(request.categoryId());
        Set<Tag> tags = tagResolver.resolve(request.tagNames());
        incrementPositions(false, request.dueDate());
        Todo todo = todoRepository.save(new Todo(
                request.title(), request.description(), request.priority(),
                request.dueDate(), category, LocalDateTime.now()));
        saveTodoTagsIfNecessary(tags, todo.getId());

        return TodoResponse.from(todo, tags);
    }

    @Override
    public TodoResponse update(Long id, TodoRequest request) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Todo not found: " + id));
        Category category = resolveCategory(request.categoryId());
        Set<Tag> tags = tagResolver.resolve(request.tagNames());
        boolean completed = request.completed() != null && request.completed();

        todo.update(request.title(), request.description(), request.priority(),
                request.dueDate(), category, completed, LocalDateTime.now());

        todoTagRepository.deleteAllByTodoId(id);
        saveTodoTagsIfNecessary(tags, id);

        return TodoResponse.from(todo, tags);
    }

    @Override
    public void patch(Long id, TodoPatchRequest request) {
        Todo todo = lockGroupAndGetTodo(id);
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
    }

    @Override
    public void reorder(List<ReorderRequest.ReorderItem> items) {
        Map<Long, Integer> positionById = items.stream()
                .collect(Collectors.toMap(ReorderRequest.ReorderItem::id, ReorderRequest.ReorderItem::position));

        List<Todo> todos = todoRepository.findAllById(positionById.keySet());
        if (todos.size() != items.size()) {
            throw new EntityNotFoundException("일부 Todo를 찾을 수 없습니다");
        }

        todoJdbcRepository.bulkUpdatePositions(items);
    }

    @Override
    public void delete(Long id) {
        if (todoRepository.deleteByIdReturningCount(id) == 0) {
            throw new EntityNotFoundException("Todo not found: " + id);
        }
    }

    private Category resolveCategory(Long categoryId) {
        if (ObjectUtils.isEmpty(categoryId)) {
            return null;
        }

        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + categoryId));
    }

    private void saveTodoTagsIfNecessary(Set<Tag> tags, Long todoId) {
        if (!tags.isEmpty()) {
            todoTagJdbcRepository.bulkInsert(todoId, Tag.extractIds(tags));
        }
    }

    private Todo lockGroupAndGetTodo(Long id) {
        List<Todo> locked = todoRepository.lockGroupByTodoId(id);
        if (locked.isEmpty()) {
            locked = todoRepository.lockNullDueDateGroup();
        }

        return locked.stream()
                .filter(t -> t.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Todo not found: " + id));
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
}
