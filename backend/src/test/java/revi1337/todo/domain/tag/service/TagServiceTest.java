package revi1337.todo.domain.tag.service;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.domain.tag.service.dto.TagResponse;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class TagServiceTest {

    @Autowired
    private TagService tagService;

    @Test
    @DisplayName("name과 color로 Tag를 저장한다")
    void save() {
        TagResponse result = tagService.save("JPA", "#94a3b8");

        assertThat(result.id()).isNotNull();
        assertThat(result.name()).isEqualTo("JPA");
        assertThat(result.color()).isEqualTo("#94a3b8");
    }

    @Test
    @DisplayName("전체 Tag 목록을 반환한다")
    void findAll() {
        tagService.save("JPA", null);
        tagService.save("Spring", null);

        List<TagResponse> result = tagService.findAll();

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Tag의 name과 color를 수정한다")
    void update() {
        TagResponse saved = tagService.save("JPA", "#94a3b8");

        TagResponse result = tagService.update(saved.id(), "Kotlin", "#6366f1");

        assertThat(result.name()).isEqualTo("Kotlin");
        assertThat(result.color()).isEqualTo("#6366f1");
    }

    @Test
    @DisplayName("존재하지 않는 Tag 수정 시 예외를 던진다")
    void update_notFound_throws() {
        assertThatThrownBy(() -> tagService.update(999L, "Kotlin", "#6366f1"))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    @DisplayName("ID로 Tag를 삭제한다")
    void deleteById() {
        TagResponse saved = tagService.save("JPA", null);

        tagService.deleteById(saved.id());

        assertThat(tagService.findAll()).isEmpty();
    }

    @Test
    @DisplayName("존재하지 않는 Tag 삭제 시 예외를 던진다")
    void deleteById_notFound_throws() {
        assertThatThrownBy(() -> tagService.deleteById(999L))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
