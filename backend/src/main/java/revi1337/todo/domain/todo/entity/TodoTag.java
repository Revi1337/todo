package revi1337.todo.domain.todo.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import revi1337.todo.domain.tag.entity.Tag;

@Entity
@Table(name = "todo_tags")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TodoTag {

    @EmbeddedId
    private TodoTagId id = new TodoTagId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("todoId")
    @JoinColumn(name = "todo_id")
    private Todo todo;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("tagId")
    @JoinColumn(name = "tag_id")
    private Tag tag;

    public TodoTag(Todo todo, Tag tag) {
        this.todo = todo;
        this.tag = tag;
    }
}
