package revi1337.todo.domain.schedule.service.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record ScheduleRequest(
        @NotNull Long todoId,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @NotNull LocalDate scheduleDate
) {
}
