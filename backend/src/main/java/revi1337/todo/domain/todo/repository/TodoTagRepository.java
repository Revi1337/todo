package revi1337.todo.domain.todo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import revi1337.todo.domain.todo.entity.TodoTag;
import revi1337.todo.domain.todo.entity.TodoTagId;

public interface TodoTagRepository extends JpaRepository<TodoTag, TodoTagId> {
}
