package revi1337.todo.domain.schedule.service;

import revi1337.todo.domain.schedule.service.dto.ScheduleResponse;

import java.time.LocalDate;
import java.util.List;

public interface TodoScheduleQueryService {

    List<ScheduleResponse> findByDate(LocalDate date);
}
