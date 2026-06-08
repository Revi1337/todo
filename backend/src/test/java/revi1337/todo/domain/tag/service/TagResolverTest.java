package revi1337.todo.domain.tag.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import revi1337.todo.domain.tag.entity.Tag;
import revi1337.todo.domain.tag.repository.TagJdbcRepository;
import revi1337.todo.domain.tag.repository.TagRepository;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class TagResolverTest {

    @Mock private TagRepository tagRepository;
    @Mock private TagJdbcRepository tagJdbcRepository;
    @Mock private CachedTagQueryService cachedTagQueryService;

    private TagResolver sut;

    @BeforeEach
    void setUp() {
        sut = new TagResolver(tagRepository, tagJdbcRepository, cachedTagQueryService);
    }

    @Test
    @DisplayName("tagNames가 null이면 빈 Set을 반환한다")
    void resolve_nullTagNames_returnsEmpty() {
        Set<Tag> result = sut.resolve(null);

        assertThat(result).isEmpty();
        verify(tagRepository, never()).findAllByNameIn(any());
    }

    @Test
    @DisplayName("tagNames가 빈 리스트이면 빈 Set을 반환한다")
    void resolve_emptyTagNames_returnsEmpty() {
        Set<Tag> result = sut.resolve(List.of());

        assertThat(result).isEmpty();
        verify(tagRepository, never()).findAllByNameIn(any());
    }

    @Test
    @DisplayName("이미 존재하는 태그는 DB에서 조회해 반환한다")
    void resolve_existingTags_returnsFromRepository() {
        Tag existingTag = createTag(1L, "JPA");
        given(tagRepository.findAllByNameIn(List.of("JPA"))).willReturn(List.of(existingTag));

        Set<Tag> result = sut.resolve(List.of("JPA"));

        assertThat(result).hasSize(1);
        assertThat(result).extracting(Tag::getName).containsExactly("JPA");
        verify(tagJdbcRepository, never()).bulkInsert(any());
        verify(cachedTagQueryService, never()).invalidateCache();
    }

    @Test
    @DisplayName("존재하지 않는 태그는 새로 생성하고 캐시를 무효화한다")
    void resolve_newTags_createsAndInvalidatesCache() {
        Tag newTag = createTag(2L, "Spring");
        given(tagRepository.findAllByNameIn(List.of("Spring"))).willReturn(List.of());
        given(tagJdbcRepository.bulkInsert(List.of("Spring"))).willReturn(List.of(newTag));

        Set<Tag> result = sut.resolve(List.of("Spring"));

        assertThat(result).hasSize(1);
        assertThat(result).extracting(Tag::getName).containsExactly("Spring");
        verify(cachedTagQueryService).invalidateCache();
    }

    @Test
    @DisplayName("기존 태그와 신규 태그가 섞여 있으면 모두 반환하고 캐시를 무효화한다")
    void resolve_mixedTags_returnsAllAndInvalidatesCache() {
        Tag existing = createTag(1L, "JPA");
        Tag created = createTag(2L, "Spring");
        given(tagRepository.findAllByNameIn(List.of("JPA", "Spring"))).willReturn(List.of(existing));
        given(tagJdbcRepository.bulkInsert(List.of("Spring"))).willReturn(List.of(created));

        Set<Tag> result = sut.resolve(List.of("JPA", "Spring"));

        assertThat(result).hasSize(2);
        assertThat(result).extracting(Tag::getName).containsExactlyInAnyOrder("JPA", "Spring");
        verify(cachedTagQueryService).invalidateCache();
    }

    @Test
    @DisplayName("앞뒤 공백이 있는 태그명은 trim 후 처리한다")
    void resolve_trimsWhitespace() {
        Tag tag = createTag(1L, "JPA");
        given(tagRepository.findAllByNameIn(List.of("JPA"))).willReturn(List.of(tag));

        Set<Tag> result = sut.resolve(List.of("  JPA  "));

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("중복 태그명은 하나로 처리한다")
    void resolve_deduplicatesTagNames() {
        Tag tag = createTag(1L, "JPA");
        given(tagRepository.findAllByNameIn(List.of("JPA"))).willReturn(List.of(tag));

        Set<Tag> result = sut.resolve(List.of("JPA", "JPA"));

        assertThat(result).hasSize(1);
    }

    private Tag createTag(Long id, String name) {
        return new Tag(id, name);
    }
}
