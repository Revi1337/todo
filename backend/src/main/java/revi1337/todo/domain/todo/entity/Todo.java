package revi1337.todo.domain.todo.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import revi1337.todo.domain.category.entity.Category;
import revi1337.todo.domain.tag.entity.Tag;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "todos")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Todo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column
    private String description;

    @Column(nullable = false)
    private boolean completed = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority = Priority.MEDIUM;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "todo_tags",
            joinColumns = @JoinColumn(name = "todo_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public Todo(String title, String description, Priority priority, LocalDate dueDate,
                Category category, Set<Tag> tags, LocalDateTime createdAt) {
        this.title = Objects.requireNonNull(title, "title must not be null");
        this.description = description;
        this.priority = priority != null ? priority : Priority.MEDIUM;
        this.dueDate = dueDate;
        this.category = category;
        this.tags = tags != null ? tags : new HashSet<>();
        this.createdAt = Objects.requireNonNull(createdAt, "createdAt must not be null");
        this.updatedAt = createdAt;
    }

    public void update(String title, String description, Priority priority, LocalDate dueDate,
                       Category category, Set<Tag> tags, boolean completed, LocalDateTime now) {
        this.title = Objects.requireNonNull(title, "title must not be null");
        this.description = description;
        this.priority = priority != null ? priority : Priority.MEDIUM;
        this.dueDate = dueDate;
        this.category = category;
        this.tags = tags != null ? tags : new HashSet<>();
        this.updatedAt = now;
        toggleCompleted(completed, now);
    }

    private void toggleCompleted(boolean completed, LocalDateTime now) {
        if (this.completed == completed) return;
        this.completed = completed;
        this.completedAt = completed ? now : null;
    }
}
