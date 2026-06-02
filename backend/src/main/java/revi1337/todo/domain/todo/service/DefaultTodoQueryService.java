package revi1337.todo.domain.todo.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.domain.todo.entity.Todo;
import revi1337.todo.domain.todo.repository.TodoRepository;
import revi1337.todo.domain.todo.repository.TodoSpecification;
import revi1337.todo.domain.todo.service.dto.TodoFilterRequest;
import revi1337.todo.domain.todo.service.dto.TodoResponse;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DefaultTodoQueryService implements TodoQueryService {

    private final TodoRepository todoRepository;

    @Override
    public List<TodoResponse> findAll(TodoFilterRequest filter) {
        Specification<Todo> spec = TodoSpecification.hasCategory(filter.category())
                .and(TodoSpecification.hasTag(filter.tag()))
                .and(TodoSpecification.hasPriority(filter.priority()))
                .and(TodoSpecification.isCompleted(filter.completed()))
                .and(TodoSpecification.hasKeyword(filter.search()))
                .and(TodoSpecification.hasDueDate(filter.dueDate()))
                .and(TodoSpecification.hasDueDateBetween(filter.dueDateFrom(), filter.dueDateTo()));

        return todoRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "position")).stream()
                .map(TodoResponse::from)
                .toList();
    }

    @Override
    public TodoResponse findById(Long id) {
        return todoRepository.findById(id)
                .map(TodoResponse::from)
                .orElseThrow(() -> new EntityNotFoundException("Todo not found: " + id));
    }
}
