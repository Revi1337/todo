package revi1337.todo.domain.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import revi1337.todo.domain.schedule.entity.TodoSchedule;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface TodoScheduleRepository extends JpaRepository<TodoSchedule, Long> {

    List<TodoSchedule> findByScheduleDate(LocalDate date);

    Optional<TodoSchedule> findByTodoId(Long todoId);

    boolean existsByTodoId(Long todoId);

    @Query("SELECT COUNT(s) > 0 FROM TodoSchedule s " +
           "WHERE s.scheduleDate = :date " +
           "AND s.id <> :excludeId " +
           "AND s.startTime < :endTime " +
           "AND s.endTime > :startTime")
    boolean existsOverlapping(
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") Long excludeId
    );
}
