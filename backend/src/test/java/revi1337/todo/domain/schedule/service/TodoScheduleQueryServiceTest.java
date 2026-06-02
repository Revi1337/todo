package revi1337.todo.domain.schedule.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.domain.schedule.service.dto.ScheduleRequest;
import revi1337.todo.domain.schedule.service.dto.ScheduleResponse;
import revi1337.todo.domain.todo.entity.Priority;
import revi1337.todo.domain.todo.entity.Todo;
import revi1337.todo.domain.todo.repository.TodoRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class TodoScheduleQueryServiceTest {

    @Autowired private TodoScheduleQueryService scheduleQueryService;
    @Autowired private TodoScheduleCommandService scheduleCommandService;
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
    @DisplayName("날짜로 스케줄 목록을 조회한다")
    void findByDate_success() {
        scheduleCommandService.create(new ScheduleRequest(todo.getId(), START, END, DATE));

        List<ScheduleResponse> result = scheduleQueryService.findByDate(DATE);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).todoId()).isEqualTo(todo.getId());
    }

    @Test
    @DisplayName("해당 날짜에 스케줄이 없으면 빈 목록을 반환한다")
    void findByDate_empty() {
        assertThat(scheduleQueryService.findByDate(DATE)).isEmpty();
    }

    @Test
    @DisplayName("다른 날짜의 스케줄은 조회되지 않는다")
    void findByDate_excludesOtherDates() {
        LocalDate otherDate = DATE.plusDays(1);
        Todo todo2 = todoRepository.save(new Todo("다른 날 Todo", null, Priority.LOW, otherDate, null, null, NOW));
        scheduleCommandService.create(new ScheduleRequest(todo.getId(), START, END, DATE));
        scheduleCommandService.create(new ScheduleRequest(todo2.getId(), START, END, otherDate));

        List<ScheduleResponse> result = scheduleQueryService.findByDate(DATE);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).todoId()).isEqualTo(todo.getId());
    }
}
