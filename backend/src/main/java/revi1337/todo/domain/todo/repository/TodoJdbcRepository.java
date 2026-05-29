package revi1337.todo.domain.todo.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import revi1337.todo.domain.todo.service.dto.ReorderRequest;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class TodoJdbcRepository {

    private final JdbcTemplate jdbcTemplate;

    public void bulkUpdatePositions(List<ReorderRequest.ReorderItem> items) {
        jdbcTemplate.batchUpdate(
                "UPDATE todos SET position = ? WHERE id = ?",
                items, items.size(),
                (ps, item) -> { ps.setInt(1, item.position()); ps.setLong(2, item.id()); }
        );
    }
}
