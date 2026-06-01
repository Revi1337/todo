package revi1337.todo.domain.todo.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import revi1337.todo.domain.todo.service.dto.ReorderRequest;
import revi1337.todo.domain.todo.service.dto.TodoFilterRequest;
import revi1337.todo.domain.todo.service.dto.TodoPatchRequest;
import revi1337.todo.domain.todo.service.dto.TodoRequest;
import revi1337.todo.domain.todo.service.dto.TodoResponse;

import java.util.List;

@Slf4j
@Primary
@Service
public class LoggingTodoService implements TodoQueryService, TodoCommandService {

    private final TodoQueryService queryDelegate;
    private final TodoCommandService commandDelegate;

    public LoggingTodoService(
            @Qualifier("defaultTodoQueryService") TodoQueryService queryDelegate,
            @Qualifier("defaultTodoCommandService") TodoCommandService commandDelegate) {
        this.queryDelegate = queryDelegate;
        this.commandDelegate = commandDelegate;
    }

    @Override
    public List<TodoResponse> findAll(TodoFilterRequest filter) {
        try {
            return queryDelegate.findAll(filter);
        } catch (RuntimeException e) {
            log.error("Todo 목록 조회 중 오류가 발생했습니다. filter: {}", filter, e);
            throw e;
        }
    }

    @Override
    public TodoResponse findById(Long id) {
        try {
            return queryDelegate.findById(id);
        } catch (RuntimeException e) {
            log.error("Todo 단건 조회 중 오류가 발생했습니다. id: {}", id, e);
            throw e;
        }
    }

    @Override
    public TodoResponse create(TodoRequest request) {
        try {
            return commandDelegate.create(request);
        } catch (RuntimeException e) {
            log.error("Todo 생성 중 오류가 발생했습니다. title: {}", request.title(), e);
            throw e;
        }
    }

    @Override
    public TodoResponse update(Long id, TodoRequest request) {
        try {
            return commandDelegate.update(id, request);
        } catch (RuntimeException e) {
            log.error("Todo 수정 중 오류가 발생했습니다. id: {}", id, e);
            throw e;
        }
    }

    @Override
    public void patch(Long id, TodoPatchRequest request) {
        try {
            commandDelegate.patch(id, request);
        } catch (RuntimeException e) {
            log.error("Todo 상태 변경 중 오류가 발생했습니다. id: {}", id, e);
            throw e;
        }
    }

    @Override
    public void reorder(List<ReorderRequest.ReorderItem> items) {
        try {
            commandDelegate.reorder(items);
        } catch (RuntimeException e) {
            log.error("Todo 순서 변경 중 오류가 발생했습니다. items: {}", items, e);
            throw e;
        }
    }

    @Override
    public void delete(Long id) {
        try {
            commandDelegate.delete(id);
        } catch (RuntimeException e) {
            log.error("Todo 삭제 중 오류가 발생했습니다. id: {}", id, e);
            throw e;
        }
    }
}
