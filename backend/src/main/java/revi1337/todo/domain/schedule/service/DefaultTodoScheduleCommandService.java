package revi1337.todo.domain.schedule.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.common.exception.DuplicateScheduleException;
import revi1337.todo.domain.schedule.entity.TodoSchedule;
import revi1337.todo.domain.schedule.repository.TodoScheduleRepository;
import revi1337.todo.domain.schedule.service.dto.ScheduleRequest;
import revi1337.todo.domain.schedule.service.dto.ScheduleResponse;
import revi1337.todo.domain.schedule.service.dto.ScheduleUpdateRequest;
import revi1337.todo.domain.todo.entity.Todo;
import revi1337.todo.domain.todo.repository.TodoRepository;

import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class DefaultTodoScheduleCommandService implements TodoScheduleCommandService {

    private final TodoScheduleRepository scheduleRepository;
    private final TodoRepository todoRepository;

    @Override
    public ScheduleResponse create(ScheduleRequest request) {
        if (scheduleRepository.existsByTodoId(request.todoId())) {
            throw new DuplicateScheduleException("이미 스케줄이 존재합니다: todoId=" + request.todoId());
        }

        Todo todo = todoRepository.findById(request.todoId())
                .orElseThrow(() -> new EntityNotFoundException("Todo not found: " + request.todoId()));

        TodoSchedule schedule = scheduleRepository.save(new TodoSchedule(
                todo,
                request.startTime(),
                request.endTime(),
                request.scheduleDate(),
                LocalDateTime.now()
        ));

        return ScheduleResponse.from(schedule);
    }

    @Override
    public ScheduleResponse update(Long id, ScheduleUpdateRequest request) {
        TodoSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Schedule not found: " + id));

        schedule.update(request.startTime(), request.endTime(), LocalDateTime.now());

        return ScheduleResponse.from(schedule);
    }

    @Override
    public void delete(Long id) {
        if (!scheduleRepository.existsById(id)) {
            throw new EntityNotFoundException("Schedule not found: " + id);
        }
        scheduleRepository.deleteById(id);
    }
}
