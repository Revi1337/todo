package revi1337.todo.domain.schedule.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import revi1337.todo.domain.todo.entity.Priority;
import revi1337.todo.domain.todo.entity.Todo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNullPointerException;

class TodoScheduleTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 6, 3, 10, 0);
    private static final LocalDate DATE = LocalDate.of(2026, 6, 3);
    private static final LocalTime START = LocalTime.of(10, 0);
    private static final LocalTime END = LocalTime.of(11, 0);

    private Todo sampleTodo() {
        return new Todo("테스트", null, Priority.MEDIUM, DATE, null, null, NOW);
    }

    @Test
    @DisplayName("정상적인 값으로 TodoSchedule을 생성한다")
    void create_success() {
        TodoSchedule schedule = new TodoSchedule(sampleTodo(), START, END, DATE, NOW);

        assertThat(schedule.getStartTime()).isEqualTo(START);
        assertThat(schedule.getEndTime()).isEqualTo(END);
        assertThat(schedule.getScheduleDate()).isEqualTo(DATE);
        assertThat(schedule.getCreatedAt()).isEqualTo(NOW);
        assertThat(schedule.getUpdatedAt()).isEqualTo(NOW);
    }

    @Test
    @DisplayName("todo가 null이면 NPE를 던진다")
    void create_nullTodo_throwsNPE() {
        assertThatNullPointerException()
                .isThrownBy(() -> new TodoSchedule(null, START, END, DATE, NOW))
                .withMessage("todo must not be null");
    }

    @Test
    @DisplayName("startTime이 null이면 NPE를 던진다")
    void create_nullStartTime_throwsNPE() {
        assertThatNullPointerException()
                .isThrownBy(() -> new TodoSchedule(sampleTodo(), null, END, DATE, NOW))
                .withMessage("startTime must not be null");
    }

    @Test
    @DisplayName("update 호출 시 startTime, endTime, updatedAt이 변경된다")
    void update_success() {
        TodoSchedule schedule = new TodoSchedule(sampleTodo(), START, END, DATE, NOW);
        LocalTime newStart = LocalTime.of(14, 0);
        LocalTime newEnd = LocalTime.of(15, 30);
        LocalDateTime updateTime = NOW.plusHours(1);

        schedule.update(newStart, newEnd, updateTime);

        assertThat(schedule.getStartTime()).isEqualTo(newStart);
        assertThat(schedule.getEndTime()).isEqualTo(newEnd);
        assertThat(schedule.getUpdatedAt()).isEqualTo(updateTime);
    }

    @Test
    @DisplayName("update 시 startTime이 null이면 NPE를 던진다")
    void update_nullStartTime_throwsNPE() {
        TodoSchedule schedule = new TodoSchedule(sampleTodo(), START, END, DATE, NOW);

        assertThatNullPointerException()
                .isThrownBy(() -> schedule.update(null, END, NOW.plusHours(1)))
                .withMessage("startTime must not be null");
    }

    @Test
    @DisplayName("익일 새벽 시간(00:00~05:59)도 startTime으로 허용된다")
    void create_earlyMorningTime_allowed() {
        LocalTime earlyMorning = LocalTime.of(2, 30);

        TodoSchedule schedule = new TodoSchedule(sampleTodo(), earlyMorning, LocalTime.of(3, 30), DATE, NOW);

        assertThat(schedule.getStartTime()).isEqualTo(earlyMorning);
    }
}
