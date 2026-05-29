package revi1337.todo.domain.tag.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Objects;

@Entity
@Table(name = "tags")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Tag {

    private static final String DEFAULT_COLOR = "#94a3b8";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column
    private String color = DEFAULT_COLOR;

    public Tag(String name, String color) {
        this.name = Objects.requireNonNull(name, "name must not be null");
        this.color = Objects.requireNonNullElse(color, DEFAULT_COLOR);
    }

    public void update(String name, String color) {
        this.name = Objects.requireNonNull(name, "name must not be null");
        this.color = Objects.requireNonNullElse(color, DEFAULT_COLOR);
    }
}
