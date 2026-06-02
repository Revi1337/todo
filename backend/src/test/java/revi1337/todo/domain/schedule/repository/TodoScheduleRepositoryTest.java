package revi1337.todo.domain.schedule.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import revi1337.todo.domain.schedule.entity.TodoSchedule;
import revi1337.todo.domain.todo.entity.Priority;
import revi1337.todo.domain.todo.entity.Todo;
import revi1337.todo.domain.todo.repository.TodoRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace.NONE;

@DataJpaTest
@AutoConfigureTestDatabase(replace = NONE)
class TodoScheduleRepositoryTest {

    @Autowired private TodoScheduleRepository scheduleRepository;
    @Autowired private TodoRepository todoRepository;

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 6, 3, 10, 0);
    private static final LocalDate DATE = LocalDate.of(2026, 6, 3);
    private static final LocalTime START = LocalTime.of(10, 0);
    private static final LocalTime END = LocalTime.of(11, 0);

    private Todo todo;

    @BeforeEach
    void setUp() {
        todo = todoRepository.save(new Todo("테스트 Todo", null, Priority.MEDIUM, DATE, null, null, NOW));
    }

    @Test
    @DisplayName("scheduleDate로 해당 날짜의 스케줄 목록을 조회한다")
    void findByScheduleDate() {
        scheduleRepository.save(new TodoSchedule(todo, START, END, DATE, NOW));

        Todo todo2 = todoRepository.save(new Todo("다른 Todo", null, Priority.LOW, DATE, null, null, NOW));
        scheduleRepository.save(new TodoSchedule(todo2, LocalTime.of(14, 0), LocalTime.of(15, 0),
                LocalDate.of(2026, 6, 4), NOW));

        List<TodoSchedule> result = scheduleRepository.findByScheduleDate(DATE);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTodo().getId()).isEqualTo(todo.getId());
    }

    @Test
    @DisplayName("todoId로 스케줄을 조회한다")
    void findByTodoId() {
        scheduleRepository.save(new TodoSchedule(todo, START, END, DATE, NOW));

        Optional<TodoSchedule> result = scheduleRepository.findByTodoId(todo.getId());

        assertThat(result).isPresent();
        assertThat(result.get().getStartTime()).isEqualTo(START);
    }

    @Test
    @DisplayName("스케줄이 없는 todoId는 empty를 반환한다")
    void findByTodoId_notFound_returnsEmpty() {
        Optional<TodoSchedule> result = scheduleRepository.findByTodoId(todo.getId());

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("existsByTodoId — 스케줄이 있으면 true를 반환한다")
    void existsByTodoId_true() {
        scheduleRepository.save(new TodoSchedule(todo, START, END, DATE, NOW));

        assertThat(scheduleRepository.existsByTodoId(todo.getId())).isTrue();
    }

    @Test
    @DisplayName("existsByTodoId — 스케줄이 없으면 false를 반환한다")
    void existsByTodoId_false() {
        assertThat(scheduleRepository.existsByTodoId(todo.getId())).isFalse();
    }

    @Test
    @DisplayName("update 후 저장하면 startTime, endTime이 반영된다")
    void update_persisted() {
        TodoSchedule schedule = scheduleRepository.save(new TodoSchedule(todo, START, END, DATE, NOW));
        LocalTime newStart = LocalTime.of(14, 0);
        LocalTime newEnd = LocalTime.of(15, 30);

        schedule.update(newStart, newEnd, NOW.plusHours(1));
        scheduleRepository.flush();

        TodoSchedule updated = scheduleRepository.findById(schedule.getId()).get();
        assertThat(updated.getStartTime()).isEqualTo(newStart);
        assertThat(updated.getEndTime()).isEqualTo(newEnd);
    }
}
