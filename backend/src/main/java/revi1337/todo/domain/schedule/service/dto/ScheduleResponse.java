package revi1337.todo.domain.schedule.service.dto;

import revi1337.todo.domain.schedule.entity.TodoSchedule;

import java.time.LocalDate;
import java.time.LocalTime;

public record ScheduleResponse(
        Long id,
        Long todoId,
        LocalTime startTime,
        LocalTime endTime,
        LocalDate scheduleDate
) {
    public static ScheduleResponse from(TodoSchedule schedule) {
        return new ScheduleResponse(
                schedule.getId(),
                schedule.getTodo().getId(),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getScheduleDate()
        );
    }
}
