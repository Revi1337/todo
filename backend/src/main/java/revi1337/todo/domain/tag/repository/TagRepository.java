package revi1337.todo.domain.tag.repository;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import revi1337.todo.domain.tag.entity.Tag;

public interface TagRepository extends JpaRepository<Tag, Long> {

    List<Tag> findAllByOrderByIdDesc();

    List<Tag> findAllByNameIn(Collection<String> names);
}
