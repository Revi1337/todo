package revi1337.todo.domain.category.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import revi1337.todo.domain.category.service.dto.CategoryResponse;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class CachedCategoryQueryServiceTest {

    @Mock
    private CategoryQueryService delegate;

    private CachedCategoryQueryService sut;

    private static final List<CategoryResponse> SAMPLE = List.of(
            new CategoryResponse(1L, "개발", "#6366f1", LocalDateTime.now()),
            new CategoryResponse(2L, "운동", "#f59e0b", LocalDateTime.now())
    );

    @BeforeEach
    void setUp() {
        sut = new CachedCategoryQueryService(delegate);
    }

    @Test
    @DisplayName("첫 번째 호출 시 delegate에서 데이터를 로드한다 (캐시 미스)")
    void findAll_firstCall_loadsFromDelegate() {
        given(delegate.findAll()).willReturn(SAMPLE);

        List<CategoryResponse> result = sut.findAll();

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

        List<CategoryResponse> first = sut.findAll();
        List<CategoryResponse> second = sut.findAll();

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
