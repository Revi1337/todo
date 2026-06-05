package revi1337.todo.domain.schedule.service;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.common.exception.DuplicateScheduleException;
import revi1337.todo.common.exception.InvalidScheduleTimeException;
import revi1337.todo.common.exception.OverlappingScheduleException;
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

    // ── 10분 단위 검증 (create) ────────────────────────────────────────────────

    @Test
    @DisplayName("create — 시작 시간이 10분 단위가 아니면 InvalidScheduleTimeException을 던진다")
    void create_invalidStartTime_throws() {
        LocalTime badStart = LocalTime.of(10, 7);

        assertThatThrownBy(() -> scheduleCommandService.create(new ScheduleRequest(todo.getId(), badStart, END, DATE)))
                .isInstanceOf(InvalidScheduleTimeException.class);
    }

    @Test
    @DisplayName("create — 종료 시간이 10분 단위가 아니면 InvalidScheduleTimeException을 던진다")
    void create_invalidEndTime_throws() {
        LocalTime badEnd = LocalTime.of(11, 35);

        assertThatThrownBy(() -> scheduleCommandService.create(new ScheduleRequest(todo.getId(), START, badEnd, DATE)))
                .isInstanceOf(InvalidScheduleTimeException.class);
    }

    @Test
    @DisplayName("create — 초가 0이 아니면 InvalidScheduleTimeException을 던진다")
    void create_nonZeroSecond_throws() {
        LocalTime badStart = LocalTime.of(10, 0, 30);

        assertThatThrownBy(() -> scheduleCommandService.create(new ScheduleRequest(todo.getId(), badStart, END, DATE)))
                .isInstanceOf(InvalidScheduleTimeException.class);
    }

    @Test
    @DisplayName("create — 시작 시간이 종료 시간과 같으면 InvalidScheduleTimeException을 던진다")
    void create_startEqualsEnd_throws() {
        assertThatThrownBy(() -> scheduleCommandService.create(new ScheduleRequest(todo.getId(), START, START, DATE)))
                .isInstanceOf(InvalidScheduleTimeException.class);
    }

    @Test
    @DisplayName("create — 시작 시간이 종료 시간보다 늦으면 InvalidScheduleTimeException을 던진다")
    void create_startAfterEnd_throws() {
        assertThatThrownBy(() -> scheduleCommandService.create(new ScheduleRequest(todo.getId(), END, START, DATE)))
                .isInstanceOf(InvalidScheduleTimeException.class);
    }

    // ── 오버랩 검증 (create) ──────────────────────────────────────────────────

    @Test
    @DisplayName("create — 같은 날짜에 완전히 겹치는 일정이 있으면 OverlappingScheduleException을 던진다")
    void create_fullyOverlapping_throws() {
        Todo other = todoRepository.save(new Todo("다른 Todo", null, Priority.LOW, DATE, null, null, NOW));
        scheduleCommandService.create(new ScheduleRequest(other.getId(), LocalTime.of(9, 0), LocalTime.of(11, 0), DATE));

        Todo another = todoRepository.save(new Todo("또 다른 Todo", null, Priority.LOW, DATE, null, null, NOW));
        assertThatThrownBy(() -> scheduleCommandService.create(new ScheduleRequest(another.getId(), LocalTime.of(9, 30), LocalTime.of(10, 30), DATE)))
                .isInstanceOf(OverlappingScheduleException.class);
    }

    @Test
    @DisplayName("create — 같은 날짜에 앞부분이 겹치는 일정이 있으면 OverlappingScheduleException을 던진다")
    void create_partialOverlap_throws() {
        Todo other = todoRepository.save(new Todo("다른 Todo", null, Priority.LOW, DATE, null, null, NOW));
        scheduleCommandService.create(new ScheduleRequest(other.getId(), LocalTime.of(9, 0), LocalTime.of(10, 30), DATE));

        Todo another = todoRepository.save(new Todo("또 다른 Todo", null, Priority.LOW, DATE, null, null, NOW));
        assertThatThrownBy(() -> scheduleCommandService.create(new ScheduleRequest(another.getId(), LocalTime.of(10, 0), LocalTime.of(11, 0), DATE)))
                .isInstanceOf(OverlappingScheduleException.class);
    }

    @Test
    @DisplayName("create — 바로 이어지는 시간대는 겹치지 않으므로 성공한다")
    void create_adjacentTime_success() {
        Todo other = todoRepository.save(new Todo("다른 Todo", null, Priority.LOW, DATE, null, null, NOW));
        scheduleCommandService.create(new ScheduleRequest(other.getId(), LocalTime.of(9, 0), LocalTime.of(10, 0), DATE));

        Todo another = todoRepository.save(new Todo("또 다른 Todo", null, Priority.LOW, DATE, null, null, NOW));
        ScheduleResponse result = scheduleCommandService.create(new ScheduleRequest(another.getId(), LocalTime.of(10, 0), LocalTime.of(11, 0), DATE));

        assertThat(result.startTime()).isEqualTo(LocalTime.of(10, 0));
    }

    @Test
    @DisplayName("create — 다른 날짜에 동일 시간대가 있어도 성공한다")
    void create_sameTimeOnDifferentDate_success() {
        Todo other = todoRepository.save(new Todo("다른 Todo", null, Priority.LOW, DATE, null, null, NOW));
        scheduleCommandService.create(new ScheduleRequest(other.getId(), START, END, DATE));

        Todo another = todoRepository.save(new Todo("또 다른 Todo", null, Priority.LOW, DATE, null, null, NOW));
        ScheduleResponse result = scheduleCommandService.create(new ScheduleRequest(another.getId(), START, END, DATE.plusDays(1)));

        assertThat(result.scheduleDate()).isEqualTo(DATE.plusDays(1));
    }

    // ── 10분 단위 검증 (update) ────────────────────────────────────────────────

    @Test
    @DisplayName("update — 시작 시간이 10분 단위가 아니면 InvalidScheduleTimeException을 던진다")
    void update_invalidStartTime_throws() {
        ScheduleResponse created = scheduleCommandService.create(new ScheduleRequest(todo.getId(), START, END, DATE));

        assertThatThrownBy(() -> scheduleCommandService.update(created.id(), new ScheduleUpdateRequest(LocalTime.of(10, 7), END)))
                .isInstanceOf(InvalidScheduleTimeException.class);
    }

    @Test
    @DisplayName("update — 시작 시간이 종료 시간보다 늦으면 InvalidScheduleTimeException을 던진다")
    void update_startAfterEnd_throws() {
        ScheduleResponse created = scheduleCommandService.create(new ScheduleRequest(todo.getId(), START, END, DATE));

        assertThatThrownBy(() -> scheduleCommandService.update(created.id(), new ScheduleUpdateRequest(END, START)))
                .isInstanceOf(InvalidScheduleTimeException.class);
    }

    // ── 오버랩 검증 (update) ──────────────────────────────────────────────────

    @Test
    @DisplayName("update — 다른 일정과 겹치면 OverlappingScheduleException을 던진다")
    void update_overlapsOther_throws() {
        scheduleCommandService.create(new ScheduleRequest(todo.getId(), LocalTime.of(9, 0), LocalTime.of(10, 0), DATE));

        Todo other = todoRepository.save(new Todo("다른 Todo", null, Priority.LOW, DATE, null, null, NOW));
        ScheduleResponse other1 = scheduleCommandService.create(new ScheduleRequest(other.getId(), LocalTime.of(11, 0), LocalTime.of(12, 0), DATE));

        // other를 9:30~10:30으로 resize → 기존 9:00~10:00과 겹침
        assertThatThrownBy(() -> scheduleCommandService.update(other1.id(), new ScheduleUpdateRequest(LocalTime.of(9, 30), LocalTime.of(10, 30))))
                .isInstanceOf(OverlappingScheduleException.class);
    }

    @Test
    @DisplayName("update — 자기 자신과 시간이 겹쳐도 (동일 시간 재설정) 성공한다")
    void update_sameTimeAsSelf_success() {
        ScheduleResponse created = scheduleCommandService.create(new ScheduleRequest(todo.getId(), START, END, DATE));

        ScheduleResponse result = scheduleCommandService.update(created.id(), new ScheduleUpdateRequest(START, END));

        assertThat(result.startTime()).isEqualTo(START);
        assertThat(result.endTime()).isEqualTo(END);
    }

    @Test
    @DisplayName("update — 다른 일정과 바로 이어지는 시간대로 변경하면 성공한다")
    void update_adjacentToOther_success() {
        scheduleCommandService.create(new ScheduleRequest(todo.getId(), LocalTime.of(9, 0), LocalTime.of(10, 0), DATE));

        Todo other = todoRepository.save(new Todo("다른 Todo", null, Priority.LOW, DATE, null, null, NOW));
        ScheduleResponse other1 = scheduleCommandService.create(new ScheduleRequest(other.getId(), LocalTime.of(11, 0), LocalTime.of(12, 0), DATE));

        // 10:00~11:00으로 변경 → 양쪽에 붙어있지만 겹치지 않음
        ScheduleResponse result = scheduleCommandService.update(other1.id(), new ScheduleUpdateRequest(LocalTime.of(10, 0), LocalTime.of(11, 0)));

        assertThat(result.startTime()).isEqualTo(LocalTime.of(10, 0));
    }
}
