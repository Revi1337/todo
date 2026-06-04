package revi1337.todo.domain.category.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import revi1337.todo.domain.category.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByOrderByIdAsc();
}
