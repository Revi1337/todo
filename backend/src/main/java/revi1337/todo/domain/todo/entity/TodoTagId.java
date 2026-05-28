package revi1337.todo.domain.todo.entity;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class TodoTagId implements Serializable {

    private Long todoId;
    private Long tagId;

    protected TodoTagId() {}

    public TodoTagId(Long todoId, Long tagId) {
        this.todoId = todoId;
        this.tagId = tagId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TodoTagId that)) return false;
        return Objects.equals(todoId, that.todoId) && Objects.equals(tagId, that.tagId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(todoId, tagId);
    }
}
