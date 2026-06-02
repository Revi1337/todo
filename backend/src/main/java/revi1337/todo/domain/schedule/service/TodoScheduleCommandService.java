package revi1337.todo.domain.schedule.service;

import revi1337.todo.domain.schedule.service.dto.ScheduleRequest;
import revi1337.todo.domain.schedule.service.dto.ScheduleResponse;
import revi1337.todo.domain.schedule.service.dto.ScheduleUpdateRequest;

public interface TodoScheduleCommandService {

    ScheduleResponse create(ScheduleRequest request);

    ScheduleResponse update(Long id, ScheduleUpdateRequest request);

    void delete(Long id);
}
