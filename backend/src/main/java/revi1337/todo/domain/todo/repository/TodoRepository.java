package revi1337.todo.domain.todo.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import revi1337.todo.domain.stats.service.dto.CategoryStatResult;
import revi1337.todo.domain.todo.entity.Todo;

import java.time.LocalDate;
import java.util.List;

public interface TodoRepository extends JpaRepository<Todo, Long>, JpaSpecificationExecutor<Todo> {

    @Override
    @EntityGraph(attributePaths = {"category", "todoTags.tag"})
    List<Todo> findAll(Specification<Todo> spec, Sort sort);

    long countByCompleted(boolean completed);

    @Query("""
            SELECT new revi1337.todo.domain.stats.service.dto.CategoryStatResult(
                c.name,
                COUNT(t),
                SUM(CASE WHEN t.completed = true THEN 1 ELSE 0 END)
            )
            FROM Todo t JOIN t.category c
            GROUP BY c.id, c.name
            """)
    List<CategoryStatResult> findCategoryStats();

    @Query(value = """
            SELECT completed_at::date AS date, COUNT(*) AS count
            FROM todos
            WHERE completed = true
              AND completed_at::date BETWEEN :from AND :to
            GROUP BY completed_at::date
            """, nativeQuery = true)
    List<Object[]> findDailyCompletedBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Todo t WHERE t.dueDate = (SELECT t2.dueDate FROM Todo t2 WHERE t2.id = :id)")
    List<Todo> lockGroupByTodoId(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Todo t WHERE t.dueDate IS NULL")
    List<Todo> lockNullDueDateGroup();

    @Modifying
    @Query("UPDATE Todo t SET t.position = t.position + 1 WHERE t.completed = :completed AND t.dueDate = :dueDate")
    void incrementPositions(@Param("completed") boolean completed, @Param("dueDate") LocalDate dueDate);

    @Modifying
    @Query("UPDATE Todo t SET t.position = t.position + 1 WHERE t.completed = :completed AND t.dueDate IS NULL")
    void incrementPositionsNullDueDate(@Param("completed") boolean completed);

    @Modifying
    @Query("UPDATE Todo t SET t.position = t.position - 1 WHERE t.completed = :completed AND t.position > :afterPosition AND t.dueDate = :dueDate")
    void decrementPositionsAfter(@Param("completed") boolean completed, @Param("afterPosition") int afterPosition, @Param("dueDate") LocalDate dueDate);

    @Modifying
    @Query("UPDATE Todo t SET t.position = t.position - 1 WHERE t.completed = :completed AND t.position > :afterPosition AND t.dueDate IS NULL")
    void decrementPositionsAfterNullDueDate(@Param("completed") boolean completed, @Param("afterPosition") int afterPosition);

    @Modifying
    @Query("DELETE FROM Todo t WHERE t.id = :id")
    int deleteByIdReturningCount(@Param("id") Long id);

    @Modifying
    @Query(value = """
            UPDATE todos SET position = data.pos
            FROM unnest(:ids, :positions) AS data(id bigint, pos int)
            WHERE todos.id = data.id
            """, nativeQuery = true)
    void bulkUpdatePositions(@Param("ids") Long[] ids, @Param("positions") int[] positions);
}
