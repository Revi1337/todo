package revi1337.todo.domain.todo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import revi1337.todo.domain.stats.controller.dto.StatsResponse.CategoryStat;
import revi1337.todo.domain.todo.entity.Todo;

import java.time.LocalDate;
import java.util.List;

public interface TodoRepository extends JpaRepository<Todo, Long>, JpaSpecificationExecutor<Todo> {

    long countByCompleted(boolean completed);

    @Query("""
            SELECT new revi1337.todo.domain.stats.controller.dto.StatsResponse$CategoryStat(
                c.name,
                COUNT(t),
                SUM(CASE WHEN t.completed = true THEN 1 ELSE 0 END)
            )
            FROM Todo t JOIN t.category c
            GROUP BY c.id, c.name
            """)
    List<CategoryStat> findCategoryStats();

    @Query(value = """
            SELECT completed_at::date AS date, COUNT(*) AS count
            FROM todos
            WHERE completed = true
              AND completed_at::date BETWEEN :from AND :to
            GROUP BY completed_at::date
            """, nativeQuery = true)
    List<Object[]> findDailyCompletedBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Todo t SET t.position = t.position + 1 WHERE t.completed = :completed")
    void incrementPositions(@Param("completed") boolean completed);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Todo t SET t.position = t.position - 1 WHERE t.completed = :completed AND t.position > :afterPosition")
    void decrementPositionsAfter(@Param("completed") boolean completed, @Param("afterPosition") int afterPosition);

    @Modifying
    @Query(value = """
            UPDATE todos SET position = data.pos
            FROM unnest(:ids, :positions) AS data(id bigint, pos int)
            WHERE todos.id = data.id
            """, nativeQuery = true)
    void bulkUpdatePositions(@Param("ids") Long[] ids, @Param("positions") int[] positions);
}
