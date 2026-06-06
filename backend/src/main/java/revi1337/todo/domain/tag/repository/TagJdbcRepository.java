package revi1337.todo.domain.tag.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.SqlProvider;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import revi1337.todo.domain.tag.entity.Tag;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.stream.IntStream;

@Repository
@RequiredArgsConstructor
public class TagJdbcRepository {

    private static final String INSERT_SQL = "INSERT INTO tags (name) VALUES (?)";

    private final JdbcTemplate jdbcTemplate;

    public List<Tag> bulkInsert(List<String> names) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.batchUpdate(
                new LoggablePreparedStatementCreator(INSERT_SQL),
                new BatchPreparedStatementSetter() {
                    @Override
                    public void setValues(PreparedStatement ps, int i) throws SQLException {
                        ps.setString(1, names.get(i));
                    }

                    @Override
                    public int getBatchSize() {
                        return names.size();
                    }
                },
                keyHolder
        );

        List<Long> ids = keyHolder.getKeyList().stream()
                .map(map -> ((Number) map.get("id")).longValue())
                .toList();

        return IntStream.range(0, names.size())
                .mapToObj(i -> new Tag(ids.get(i), names.get(i)))
                .toList();
    }

    private record LoggablePreparedStatementCreator(String sql) implements PreparedStatementCreator, SqlProvider {

        @Override
        public PreparedStatement createPreparedStatement(Connection con) throws SQLException {
            return con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
        }

        @Override
        public String getSql() {
            return sql;
        }
    }
}
