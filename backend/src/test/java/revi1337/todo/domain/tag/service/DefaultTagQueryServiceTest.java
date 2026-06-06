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
class DefaultTagQueryServiceTest {

    @Autowired
    private TagCommandService tagCommandService;
    @Autowired
    private DefaultTagQueryService defaultTagQueryService;

    @Test
    @DisplayName("name으로 Tag를 저장한다")
    void save() {
        TagResponse result = tagCommandService.save("JPA");

        assertThat(result.id()).isNotNull();
        assertThat(result.name()).isEqualTo("JPA");
    }

    @Test
    @DisplayName("전체 Tag 목록을 ID 내림차순으로 반환한다")
    void findAll() {
        TagResponse first = tagCommandService.save("JPA");
        TagResponse second = tagCommandService.save("Spring");

        List<TagResponse> result = defaultTagQueryService.findAll();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).id()).isEqualTo(second.id());
        assertThat(result.get(1).id()).isEqualTo(first.id());
        assertThat(result.get(0).id()).isGreaterThan(result.get(1).id());
    }

    @Test
    @DisplayName("Tag의 name을 수정한다")
    void update() {
        TagResponse saved = tagCommandService.save("JPA");

        TagResponse result = tagCommandService.update(saved.id(), "Kotlin");

        assertThat(result.name()).isEqualTo("Kotlin");
    }

    @Test
    @DisplayName("존재하지 않는 Tag 수정 시 예외를 던진다")
    void update_notFound_throws() {
        assertThatThrownBy(() -> tagCommandService.update(999L, "Kotlin"))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    @DisplayName("ID로 Tag를 삭제하면 DB에서 사라진다")
    void deleteById() {
        TagResponse saved = tagCommandService.save("JPA");
        tagCommandService.deleteById(saved.id());

        assertThat(defaultTagQueryService.findAll()).isEmpty();
    }

    @Test
    @DisplayName("존재하지 않는 Tag 삭제 시 예외를 던진다")
    void deleteById_notFound_throws() {
        assertThatThrownBy(() -> tagCommandService.deleteById(999L))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
