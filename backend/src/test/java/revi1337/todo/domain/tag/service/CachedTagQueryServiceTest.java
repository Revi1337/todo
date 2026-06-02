package revi1337.todo.domain.tag.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import revi1337.todo.domain.tag.service.dto.TagResponse;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class CachedTagQueryServiceTest {

    @Mock
    private TagQueryService delegate;

    private CachedTagQueryService sut;

    private static final List<TagResponse> SAMPLE = List.of(
            new TagResponse(1L, "JPA", "#94a3b8"),
            new TagResponse(2L, "Spring", "#6366f1")
    );

    @BeforeEach
    void setUp() {
        sut = new CachedTagQueryService(delegate);
    }

    @Test
    @DisplayName("첫 번째 호출 시 delegate에서 데이터를 로드한다 (캐시 미스)")
    void findAll_firstCall_loadsFromDelegate() {
        given(delegate.findAll()).willReturn(SAMPLE);

        List<TagResponse> result = sut.findAll();

        assertThat(result).hasSize(2);
        verify(delegate, times(1)).findAll();
    }

    @Test
    @DisplayName("두 번째 호출부터는 delegate를 호출하지 않는다 (캐시 히트)")
    void findAll_secondCall_returnsCacheWithoutDelegate() {
        given(delegate.findAll()).willReturn(SAMPLE);

        sut.findAll();
        sut.findAll();
        sut.findAll();

        verify(delegate, times(1)).findAll();
    }

    @Test
    @DisplayName("캐시된 목록을 반환한다")
    void findAll_returnsCachedList() {
        given(delegate.findAll()).willReturn(SAMPLE);

        List<TagResponse> first = sut.findAll();
        List<TagResponse> second = sut.findAll();

        assertThat(first).isSameAs(second);
    }

    @Test
    @DisplayName("delegate가 빈 목록을 반환해도 이후 호출에서 delegate를 재호출하지 않는다")
    void findAll_emptyDelegate_doesNotReload() {
        given(delegate.findAll()).willReturn(List.of());

        sut.findAll();
        sut.findAll();

        verify(delegate, times(1)).findAll();
    }
}
