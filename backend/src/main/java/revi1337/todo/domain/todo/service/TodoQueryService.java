package revi1337.todo.domain.todo.service;

import revi1337.todo.domain.todo.service.dto.TodoFilterRequest;
import revi1337.todo.domain.todo.service.dto.TodoResponse;

import java.util.List;

public interface TodoQueryService {

    List<TodoResponse> findAll(TodoFilterRequest filter);

    TodoResponse findById(Long id);
}
