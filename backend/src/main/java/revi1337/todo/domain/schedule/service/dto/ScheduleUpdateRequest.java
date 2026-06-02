package revi1337.todo.domain.schedule.service.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record ScheduleUpdateRequest(
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime
) {
}
