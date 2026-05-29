package revi1337.todo.domain.todo.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import revi1337.todo.domain.category.entity.Category;
import revi1337.todo.domain.tag.entity.Tag;

import org.springframework.util.ObjectUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

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

    @Column(columnDefinition = "TEXT")
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

    @OneToMany(mappedBy = "todo", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TodoTag> todoTags = new HashSet<>();

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
        this.priority = resolvePriority(priority);
        this.dueDate = dueDate;
        this.category = category;
        this.createdAt = Objects.requireNonNull(createdAt, "createdAt must not be null");
        this.updatedAt = createdAt;
        applyTags(tags);
    }

    public void update(String title, String description, Priority priority, LocalDate dueDate,
            Category category, Set<Tag> tags, boolean completed, LocalDateTime now) {
        this.title = Objects.requireNonNull(title, "title must not be null");
        this.description = description;
        this.priority = resolvePriority(priority);
        this.dueDate = dueDate;
        this.category = category;
        this.updatedAt = now;
        applyTags(tags);
        toggleCompleted(completed, now);
    }

    public Set<Tag> getTags() {
        return todoTags.stream().map(TodoTag::getTag).collect(Collectors.toSet());
    }

    private Priority resolvePriority(Priority priority) {
        if (ObjectUtils.isEmpty(priority)) {
            return Priority.MEDIUM;
        }

        return priority;
    }

    private void applyTags(Set<Tag> tags) {
        Set<Long> newTagIds = ObjectUtils.isEmpty(tags) ? new java.util.HashSet<>()
                : tags.stream().map(Tag::getId).collect(Collectors.toSet());

        this.todoTags.removeIf(todoTag -> !newTagIds.contains(todoTag.getTag().getId()));

        if (!ObjectUtils.isEmpty(tags)) {
            Set<Long> currentTagIds = this.todoTags.stream()
                    .map(tt -> tt.getTag().getId())
                    .collect(Collectors.toSet());

            tags.stream()
                    .filter(tag -> !currentTagIds.contains(tag.getId()))
                    .forEach(tag -> this.todoTags.add(new TodoTag(this, tag)));
        }
    }

    private void toggleCompleted(boolean completed, LocalDateTime now) {
        if (this.completed == completed) {
            return;
        }
        this.completed = completed;
        if (completed) {
            this.completedAt = now;
        } else {
            this.completedAt = null;
        }
    }
}
