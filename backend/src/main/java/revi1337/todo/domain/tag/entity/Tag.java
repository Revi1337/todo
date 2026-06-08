package revi1337.todo.domain.tag.entity;

import jakarta.persistence.*;
import java.util.List;
import java.util.Set;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.Objects;

@Entity
@Table(name = "tags")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    public Tag(String name) {
        this.name = Objects.requireNonNull(name, "name must not be null");
    }

    public Tag(Long id, String name) {
        this.id = Objects.requireNonNull(id, "id must not be null");
        this.name = Objects.requireNonNull(name, "name must not be null");
    }

    public void update(String name) {
        this.name = Objects.requireNonNull(name, "name must not be null");
    }

    public static List<Long> extractIds(Set<Tag> tags) {
        return tags.stream().map(Tag::getId).toList();
    }
}
