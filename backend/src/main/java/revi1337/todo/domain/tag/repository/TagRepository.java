package revi1337.todo.domain.tag.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import revi1337.todo.domain.tag.entity.Tag;

public interface TagRepository extends JpaRepository<Tag, Long> {
}
