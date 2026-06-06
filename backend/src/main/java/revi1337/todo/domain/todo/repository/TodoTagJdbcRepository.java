package revi1337.todo.domain.todo.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class TodoTagJdbcRepository {

    private final JdbcTemplate jdbcTemplate;

    public void bulkInsert(Long todoId, Collection<Long> tagIds) {
        List<Long> ids = new ArrayList<>(tagIds);
        jdbcTemplate.batchUpdate(
                "INSERT INTO todo_tags (todo_id, tag_id) VALUES (?, ?)",
                ids, ids.size(),
                (ps, tagId) -> {
                    ps.setLong(1, todoId);
                    ps.setLong(2, tagId);
                }
        );
    }
}
