package revi1337.todo.domain.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import revi1337.todo.domain.schedule.entity.TodoSchedule;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TodoScheduleRepository extends JpaRepository<TodoSchedule, Long> {

    List<TodoSchedule> findByScheduleDate(LocalDate date);

    Optional<TodoSchedule> findByTodoId(Long todoId);

    boolean existsByTodoId(Long todoId);
}
