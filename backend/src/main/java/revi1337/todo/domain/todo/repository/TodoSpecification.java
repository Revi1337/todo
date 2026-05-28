package revi1337.todo.domain.todo.repository;

import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;
import revi1337.todo.domain.todo.entity.Priority;
import revi1337.todo.domain.todo.entity.Todo;

import java.time.LocalDate;

public class TodoSpecification {

    public static Specification<Todo> hasCategory(Long categoryId) {
        return (root, query, cb) -> categoryId == null ? null
                : cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Todo> hasTag(Long tagId) {
        return (root, query, cb) -> {
            if (tagId == null) return null;
            query.distinct(true);
            Join<Object, Object> tags = root.join("tags");
            return cb.equal(tags.get("id"), tagId);
        };
    }

    public static Specification<Todo> hasPriority(Priority priority) {
        return (root, query, cb) -> priority == null ? null
                : cb.equal(root.get("priority"), priority);
    }

    public static Specification<Todo> isCompleted(Boolean completed) {
        return (root, query, cb) -> completed == null ? null
                : cb.equal(root.get("completed"), completed);
    }

    public static Specification<Todo> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) return null;
            String pattern = "%" + keyword + "%";
            return cb.or(
                    cb.like(root.get("title"), pattern),
                    cb.like(root.get("description"), pattern)
            );
        };
    }

    public static Specification<Todo> hasDueDate(LocalDate dueDate) {
        return (root, query, cb) -> dueDate == null ? null
                : cb.equal(root.get("dueDate"), dueDate);
    }
}
