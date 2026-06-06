package revi1337.todo.domain.todo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import revi1337.todo.domain.todo.entity.TodoTag;
import revi1337.todo.domain.todo.entity.TodoTagId;

public interface TodoTagRepository extends JpaRepository<TodoTag, TodoTagId> {

    @Modifying
    @Query("DELETE FROM TodoTag t WHERE t.todo.id = :todoId")
    void deleteAllByTodoId(@Param("todoId") Long todoId);
}
