package revi1337.todo.domain.schedule.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.domain.schedule.repository.TodoScheduleRepository;
import revi1337.todo.domain.schedule.service.dto.ScheduleResponse;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DefaultTodoScheduleQueryService implements TodoScheduleQueryService {

    private final TodoScheduleRepository scheduleRepository;

    @Override
    public List<ScheduleResponse> findByDate(LocalDate date) {
        return scheduleRepository.findByScheduleDate(date).stream()
                .map(ScheduleResponse::from)
                .toList();
    }
}
