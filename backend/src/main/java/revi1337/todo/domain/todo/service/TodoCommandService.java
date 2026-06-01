package revi1337.todo.domain.todo.service;

import revi1337.todo.domain.todo.service.dto.ReorderRequest;
import revi1337.todo.domain.todo.service.dto.TodoPatchRequest;
import revi1337.todo.domain.todo.service.dto.TodoRequest;
import revi1337.todo.domain.todo.service.dto.TodoResponse;

import java.util.List;

public interface TodoCommandService {

    TodoResponse create(TodoRequest request);

    TodoResponse update(Long id, TodoRequest request);

    void patch(Long id, TodoPatchRequest request);

    void reorder(List<ReorderRequest.ReorderItem> items);

    void delete(Long id);
}
