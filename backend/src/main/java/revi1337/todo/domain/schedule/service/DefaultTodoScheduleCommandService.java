package revi1337.todo.domain.schedule.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.common.exception.DuplicateScheduleException;
import revi1337.todo.common.exception.InvalidScheduleTimeException;
import revi1337.todo.common.exception.OverlappingScheduleException;
import revi1337.todo.domain.schedule.entity.TodoSchedule;
import revi1337.todo.domain.schedule.repository.TodoScheduleRepository;
import revi1337.todo.domain.schedule.service.dto.ScheduleRequest;
import revi1337.todo.domain.schedule.service.dto.ScheduleResponse;
import revi1337.todo.domain.schedule.service.dto.ScheduleUpdateRequest;
import revi1337.todo.domain.todo.entity.Todo;
import revi1337.todo.domain.todo.repository.TodoRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@Transactional
@RequiredArgsConstructor
public class DefaultTodoScheduleCommandService implements TodoScheduleCommandService {

    private final TodoScheduleRepository scheduleRepository;
    private final TodoRepository todoRepository;

    @Override
    public ScheduleResponse create(ScheduleRequest request) {
        validateTimeSlot(request.startTime(), request.endTime());

        if (scheduleRepository.existsByTodoId(request.todoId())) {
            throw new DuplicateScheduleException("이미 스케줄이 존재합니다: todoId=" + request.todoId());
        }

        if (scheduleRepository.existsOverlapping(request.scheduleDate(), request.startTime(), request.endTime(), 0L)) {
            throw new OverlappingScheduleException("해당 시간대에 이미 다른 일정이 있습니다.");
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
        validateTimeSlot(request.startTime(), request.endTime());

        TodoSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Schedule not found: " + id));

        if (scheduleRepository.existsOverlapping(schedule.getScheduleDate(), request.startTime(), request.endTime(), id)) {
            throw new OverlappingScheduleException("해당 시간대에 이미 다른 일정이 있습니다.");
        }

        schedule.update(request.startTime(), request.endTime(), LocalDateTime.now());

        return ScheduleResponse.from(schedule);
    }

    @Override
    public void delete(Long id) {
        int deleted = scheduleRepository.deleteByIdReturningCount(id);
        if (deleted == 0) {
            throw new EntityNotFoundException("Schedule not found: " + id);
        }
    }

    private void validateTimeSlot(LocalTime startTime, LocalTime endTime) {
        if (startTime.getMinute() % 10 != 0 || startTime.getSecond() != 0) {
            throw new InvalidScheduleTimeException("시작 시간은 10분 단위여야 합니다.");
        }
        if (endTime.getMinute() % 10 != 0 || endTime.getSecond() != 0) {
            throw new InvalidScheduleTimeException("종료 시간은 10분 단위여야 합니다.");
        }
        if (!startTime.isBefore(endTime)) {
            throw new InvalidScheduleTimeException("시작 시간은 종료 시간보다 이전이어야 합니다.");
        }
    }
}
