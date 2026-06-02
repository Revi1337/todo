package revi1337.todo.domain.schedule.service;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.common.exception.DuplicateScheduleException;
import revi1337.todo.domain.schedule.service.dto.ScheduleRequest;
import revi1337.todo.domain.schedule.service.dto.ScheduleResponse;
import revi1337.todo.domain.schedule.service.dto.ScheduleUpdateRequest;
import revi1337.todo.domain.todo.entity.Priority;
import revi1337.todo.domain.todo.entity.Todo;
import revi1337.todo.domain.todo.repository.TodoRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class TodoScheduleCommandServiceTest {

    @Autowired private TodoScheduleCommandService scheduleCommandService;
    @Autowired private TodoScheduleQueryService scheduleQueryService;
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
    @DisplayName("스케줄을 생성하고 ScheduleResponse를 반환한다")
    void create_success() {
        ScheduleResponse result = scheduleCommandService.create(new ScheduleRequest(todo.getId(), START, END, DATE));

        assertThat(result.id()).isNotNull();
        assertThat(result.todoId()).isEqualTo(todo.getId());
        assertThat(result.startTime()).isEqualTo(START);
        assertThat(result.endTime()).isEqualTo(END);
        assertThat(result.scheduleDate()).isEqualTo(DATE);
    }

    @Test
    @DisplayName("동일한 Todo에 스케줄을 중복 생성하면 DuplicateScheduleException을 던진다")
    void create_duplicate_throws() {
        scheduleCommandService.create(new ScheduleRequest(todo.getId(), START, END, DATE));

        assertThatThrownBy(() -> scheduleCommandService.create(new ScheduleRequest(todo.getId(), START, END, DATE)))
                .isInstanceOf(DuplicateScheduleException.class);
    }

    @Test
    @DisplayName("존재하지 않는 todoId로 생성 시 EntityNotFoundException을 던진다")
    void create_todoNotFound_throws() {
        assertThatThrownBy(() -> scheduleCommandService.create(new ScheduleRequest(999L, START, END, DATE)))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    @DisplayName("스케줄의 시간을 수정한다")
    void update_success() {
        ScheduleResponse created = scheduleCommandService.create(new ScheduleRequest(todo.getId(), START, END, DATE));
        LocalTime newStart = LocalTime.of(14, 0);
        LocalTime newEnd = LocalTime.of(15, 30);

        ScheduleResponse result = scheduleCommandService.update(created.id(), new ScheduleUpdateRequest(newStart, newEnd));

        assertThat(result.startTime()).isEqualTo(newStart);
        assertThat(result.endTime()).isEqualTo(newEnd);
    }

    @Test
    @DisplayName("존재하지 않는 스케줄 수정 시 EntityNotFoundException을 던진다")
    void update_notFound_throws() {
        assertThatThrownBy(() -> scheduleCommandService.update(999L, new ScheduleUpdateRequest(START, END)))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    @DisplayName("스케줄을 삭제한다")
    void delete_success() {
        ScheduleResponse created = scheduleCommandService.create(new ScheduleRequest(todo.getId(), START, END, DATE));

        scheduleCommandService.delete(created.id());

        assertThat(scheduleQueryService.findByDate(DATE)).isEmpty();
    }

    @Test
    @DisplayName("존재하지 않는 스케줄 삭제 시 EntityNotFoundException을 던진다")
    void delete_notFound_throws() {
        assertThatThrownBy(() -> scheduleCommandService.delete(999L))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
