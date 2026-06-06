package revi1337.todo.domain.todo.service;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ObjectUtils;
import revi1337.todo.domain.category.entity.Category;
import revi1337.todo.domain.category.repository.CategoryRepository;
import revi1337.todo.domain.tag.entity.Tag;
import revi1337.todo.domain.tag.repository.TagJdbcRepository;
import revi1337.todo.domain.tag.repository.TagRepository;
import revi1337.todo.domain.tag.service.CachedTagQueryService;
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
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class DefaultTodoCommandService implements TodoCommandService {

    private final TodoRepository todoRepository;
    private final TodoJdbcRepository todoJdbcRepository;
    private final TodoTagRepository todoTagRepository;
    private final TodoTagJdbcRepository todoTagJdbcRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final TagJdbcRepository tagJdbcRepository;
    private final CachedTagQueryService cachedTagQueryService;

    public DefaultTodoCommandService(TodoRepository todoRepository, TodoJdbcRepository todoJdbcRepository,
            TodoTagRepository todoTagRepository, TodoTagJdbcRepository todoTagJdbcRepository,
            CategoryRepository categoryRepository, TagRepository tagRepository,
            TagJdbcRepository tagJdbcRepository, CachedTagQueryService cachedTagQueryService) {
        this.todoRepository = todoRepository;
        this.todoJdbcRepository = todoJdbcRepository;
        this.todoTagRepository = todoTagRepository;
        this.todoTagJdbcRepository = todoTagJdbcRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.tagJdbcRepository = tagJdbcRepository;
        this.cachedTagQueryService = cachedTagQueryService;
    }

    @Override
    public TodoResponse create(TodoRequest request) {
        Category category = resolveCategory(request.categoryId());
        Set<Tag> tags = resolveTags(request.tagNames());
        incrementPositions(false, request.dueDate());
        Todo todo = todoRepository.save(new Todo(
                request.title(), request.description(), request.priority(),
                request.dueDate(), category, LocalDateTime.now()));

        if (!tags.isEmpty()) {
            List<Long> tagIds = tags.stream().map(Tag::getId).toList();
            todoTagJdbcRepository.bulkInsert(todo.getId(), tagIds);
        }

        return TodoResponse.from(todo, tags);
    }

    @Override
    public TodoResponse update(Long id, TodoRequest request) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Todo not found: " + id));
        Category category = resolveCategory(request.categoryId());
        Set<Tag> tags = resolveTags(request.tagNames());
        boolean completed = request.completed() != null && request.completed();

        todo.update(request.title(), request.description(), request.priority(),
                request.dueDate(), category, completed, LocalDateTime.now());

        todoTagRepository.deleteAllByTodoId(id);
        if (!tags.isEmpty()) {
            List<Long> tagIds = tags.stream().map(Tag::getId).toList();
            todoTagJdbcRepository.bulkInsert(id, tagIds);
        }

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

    private Set<Tag> resolveTags(List<String> tagNames) {
        if (ObjectUtils.isEmpty(tagNames)) {
            return new HashSet<>();
        }
        List<String> normalized = normalizeTagNames(tagNames);
        Map<String, Tag> tagByName = findExistingTagsByName(normalized);
        createAndRegisterMissingTags(normalized, tagByName);

        return new HashSet<>(tagByName.values());
    }

    private List<String> normalizeTagNames(List<String> tagNames) {
        return tagNames.stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .toList();
    }

    private Map<String, Tag> findExistingTagsByName(List<String> names) {
        Map<String, Tag> tagByName = new HashMap<>();
        tagRepository.findAllByNameIn(names)
                .forEach(tag -> tagByName.put(tag.getName(), tag));

        return tagByName;
    }

    private void createAndRegisterMissingTags(List<String> normalized, Map<String, Tag> tagByName) {
        List<String> newNames = normalized.stream()
                .filter(name -> !tagByName.containsKey(name))
                .toList();
        if (!newNames.isEmpty()) {
            tagJdbcRepository.bulkInsert(newNames)
                    .forEach(tag -> tagByName.put(tag.getName(), tag));
            cachedTagQueryService.invalidateCache();
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
