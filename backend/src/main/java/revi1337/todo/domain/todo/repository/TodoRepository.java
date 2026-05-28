package revi1337.todo.domain.todo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
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
            SELECT DATE(completed_at) as date, COUNT(*) as count
            FROM todos
            WHERE completed = 1
              AND DATE(completed_at) BETWEEN :from AND :to
            GROUP BY DATE(completed_at)
            """, nativeQuery = true)
    List<Object[]> findDailyCompletedBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
