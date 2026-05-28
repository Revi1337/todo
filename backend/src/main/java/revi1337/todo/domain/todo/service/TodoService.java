package revi1337.todo.domain.todo.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ObjectUtils;
import revi1337.todo.domain.category.entity.Category;
import revi1337.todo.domain.category.repository.CategoryRepository;
import revi1337.todo.domain.tag.entity.Tag;
import revi1337.todo.domain.tag.repository.TagRepository;
import revi1337.todo.domain.todo.entity.Todo;
import revi1337.todo.domain.todo.repository.TodoRepository;
import revi1337.todo.domain.todo.repository.TodoSpecification;
import revi1337.todo.domain.todo.service.dto.TodoFilterRequest;
import revi1337.todo.domain.todo.service.dto.TodoRequest;
import revi1337.todo.domain.todo.service.dto.TodoResponse;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TodoService {

    private final TodoRepository todoRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;

    @Transactional
    public TodoResponse create(TodoRequest request) {
        Category category = resolveCategory(request.categoryId());
        Set<Tag> tags = resolveTags(request.tagIds());
        Todo todo = todoRepository.save(new Todo(
                request.title(), request.description(), request.priority(),
                request.dueDate(), category, tags, LocalDateTime.now()
        ));

        return TodoResponse.from(todo);
    }

    public List<TodoResponse> findAll(TodoFilterRequest filter) {
        Specification<Todo> spec = TodoSpecification.hasCategory(filter.category())
                .and(TodoSpecification.hasTag(filter.tag()))
                .and(TodoSpecification.hasPriority(filter.priority()))
                .and(TodoSpecification.isCompleted(filter.completed()))
                .and(TodoSpecification.hasKeyword(filter.search()))
                .and(TodoSpecification.hasDueDate(filter.dueDate()));

        return todoRepository.findAll(spec).stream()
                .map(TodoResponse::from)
                .toList();
    }

    @Transactional
    public TodoResponse update(Long id, TodoRequest request) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Todo not found: " + id));
        Category category = resolveCategory(request.categoryId());
        Set<Tag> tags = resolveTags(request.tagIds());
        boolean completed = request.completed() != null && request.completed();
        todo.update(request.title(), request.description(), request.priority(),
                request.dueDate(), category, tags, completed, LocalDateTime.now());

        return TodoResponse.from(todo);
    }

    @Transactional
    public void delete(Long id) {
        if (!todoRepository.existsById(id)) {
            throw new EntityNotFoundException("Todo not found: " + id);
        }
        todoRepository.deleteById(id);
    }

    private Category resolveCategory(Long categoryId) {
        if (ObjectUtils.isEmpty(categoryId)) {
            return null;
        }

        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + categoryId));
    }

    private Set<Tag> resolveTags(List<Long> tagIds) {
        if (ObjectUtils.isEmpty(tagIds)) {
            return new HashSet<>();
        }

        return new HashSet<>(tagRepository.findAllById(tagIds));
    }
}
