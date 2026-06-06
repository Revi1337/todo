package revi1337.todo.domain.tag.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.domain.tag.entity.Tag;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class TagJdbcRepositoryTest {

    @Autowired private TagJdbcRepository tagJdbcRepository;

    @Test
    @DisplayName("bulkInsert — 이름 목록을 일괄 삽입하고 Tag 엔티티를 반환한다")
    void bulkInsert_insertsAllAndReturnsTags() {
        List<Tag> result = tagJdbcRepository.bulkInsert(List.of("spring", "jpa", "redis"));

        assertThat(result).hasSize(3);
        assertThat(result).extracting(Tag::getId).doesNotContainNull();
        assertThat(result).extracting(Tag::getName)
                .containsExactlyInAnyOrder("spring", "jpa", "redis");
    }

    @Test
    @DisplayName("bulkInsert — 단일 이름도 정상적으로 삽입되고 Tag를 반환한다")
    void bulkInsert_singleName_returnsOneTag() {
        List<Tag> result = tagJdbcRepository.bulkInsert(List.of("only"));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isNotNull();
        assertThat(result.get(0).getName()).isEqualTo("only");
    }
}
