package revi1337.todo.domain.tag.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import revi1337.todo.domain.tag.entity.Tag;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace.NONE;

@DataJpaTest
@AutoConfigureTestDatabase(replace = NONE)
class TagRepositoryTest {

    @Autowired
    private TagRepository tagRepository;

    @Test
    @DisplayName("Tag를 저장하고 ID로 조회한다")
    void save_and_findById() {
        Tag saved = tagRepository.save(new Tag("JPA"));

        assertThat(tagRepository.findById(saved.getId())).isPresent();
    }

    @Test
    @DisplayName("전체 Tag 목록을 ID 내림차순으로 조회한다")
    void findAllByOrderByIdDesc() {
        Tag first = tagRepository.save(new Tag("JPA"));
        Tag second = tagRepository.save(new Tag("Spring"));

        List<Tag> tags = tagRepository.findAllByOrderByIdDesc();

        assertThat(tags).hasSize(2);
        assertThat(tags.get(0).getId()).isGreaterThan(tags.get(1).getId());
        assertThat(tags.get(0).getId()).isEqualTo(second.getId());
        assertThat(tags.get(1).getId()).isEqualTo(first.getId());
    }

    @Test
    @DisplayName("이름 목록으로 Tag를 조회한다")
    void findAllByNameIn() {
        tagRepository.save(new Tag("JPA"));
        tagRepository.save(new Tag("Spring"));
        tagRepository.save(new Tag("Kotlin"));

        List<Tag> result = tagRepository.findAllByNameIn(List.of("JPA", "Kotlin"));

        assertThat(result).hasSize(2);
        assertThat(result).extracting(Tag::getName).containsExactlyInAnyOrder("JPA", "Kotlin");
    }

    @Test
    @DisplayName("존재하지 않는 이름은 결과에 포함되지 않는다")
    void findAllByNameIn_missingNames_excluded() {
        tagRepository.save(new Tag("JPA"));

        List<Tag> result = tagRepository.findAllByNameIn(List.of("JPA", "없는태그"));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("JPA");
    }
}
