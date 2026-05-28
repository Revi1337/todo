package revi1337.todo.domain.tag.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import revi1337.todo.domain.tag.entity.Tag;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace.NONE;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = NONE)
class TagRepositoryTest {

    @Autowired
    private TagRepository tagRepository;

    @Test
    @DisplayName("Tag를 저장하고 ID로 조회한다")
    void save_and_findById() {
        Tag saved = tagRepository.save(new Tag("JPA", "#94a3b8"));

        assertThat(tagRepository.findById(saved.getId())).isPresent();
    }

    @Test
    @DisplayName("전체 Tag 목록을 조회한다")
    void findAll() {
        tagRepository.save(new Tag("JPA", "#94a3b8"));
        tagRepository.save(new Tag("Spring", "#6366f1"));

        List<Tag> tags = tagRepository.findAll();

        assertThat(tags).hasSize(2);
    }
}
