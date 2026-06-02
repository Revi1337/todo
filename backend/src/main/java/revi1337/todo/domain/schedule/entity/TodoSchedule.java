package revi1337.todo.domain.schedule.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import revi1337.todo.domain.todo.entity.Todo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Objects;

@Entity
@Table(
        name = "todo_schedules",
        uniqueConstraints = @UniqueConstraint(name = "uq_todo_schedules_todo_id", columnNames = "todo_id")
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TodoSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "todo_id", nullable = false)
    private Todo todo;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "schedule_date", nullable = false)
    private LocalDate scheduleDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public TodoSchedule(Todo todo, LocalTime startTime, LocalTime endTime,
                        LocalDate scheduleDate, LocalDateTime now) {
        this.todo = Objects.requireNonNull(todo, "todo must not be null");
        this.startTime = Objects.requireNonNull(startTime, "startTime must not be null");
        this.endTime = Objects.requireNonNull(endTime, "endTime must not be null");
        this.scheduleDate = Objects.requireNonNull(scheduleDate, "scheduleDate must not be null");
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void update(LocalTime startTime, LocalTime endTime, LocalDateTime now) {
        this.startTime = Objects.requireNonNull(startTime, "startTime must not be null");
        this.endTime = Objects.requireNonNull(endTime, "endTime must not be null");
        this.updatedAt = now;
    }
}
