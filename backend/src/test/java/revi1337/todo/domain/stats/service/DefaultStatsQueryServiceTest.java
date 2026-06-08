package revi1337.todo.domain.stats.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import revi1337.todo.domain.stats.service.dto.StatsResponse;
import revi1337.todo.domain.stats.service.dto.CategoryStatResult;
import revi1337.todo.domain.todo.repository.TodoRepository;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class DefaultStatsQueryServiceTest {

    @Mock
    private TodoRepository todoRepository;

    private DefaultStatsQueryService sut;

    @BeforeEach
    void setUp() {
        sut = new DefaultStatsQueryService(todoRepository);
    }

    @Test
    @DisplayName("전체 Todo 수와 완료 수로 완료율을 계산한다")
    void getStats_calculatesCompletionRate() {
        given(todoRepository.count()).willReturn(10L);
        given(todoRepository.countByCompleted(true)).willReturn(7L);
        given(todoRepository.findCategoryStats()).willReturn(List.of());
        given(todoRepository.findDailyCompletedBetween(any(), any())).willReturn(List.of());

        StatsResponse result = sut.getStats();

        assertThat(result.totalCount()).isEqualTo(10L);
        assertThat(result.completedCount()).isEqualTo(7L);
        assertThat(result.completionRate()).isEqualTo(70.0);
    }

    @Test
    @DisplayName("Todo가 없으면 완료율은 0이다")
    void getStats_zeroTodos_completionRateIsZero() {
        given(todoRepository.count()).willReturn(0L);
        given(todoRepository.countByCompleted(true)).willReturn(0L);
        given(todoRepository.findCategoryStats()).willReturn(List.of());
        given(todoRepository.findDailyCompletedBetween(any(), any())).willReturn(List.of());

        StatsResponse result = sut.getStats();

        assertThat(result.completionRate()).isEqualTo(0.0);
    }

    @Test
    @DisplayName("CategoryStatResult를 StatsResponse.CategoryStat으로 변환한다")
    void getStats_mapsCategoryStats() {
        given(todoRepository.count()).willReturn(5L);
        given(todoRepository.countByCompleted(true)).willReturn(3L);
        given(todoRepository.findCategoryStats()).willReturn(List.of(
                new CategoryStatResult("개발", 5L, 3L),
                new CategoryStatResult("학습", 2L, 1L)
        ));
        given(todoRepository.findDailyCompletedBetween(any(), any())).willReturn(List.of());

        StatsResponse result = sut.getStats();

        assertThat(result.byCategory()).hasSize(2);
        assertThat(result.byCategory()).extracting(StatsResponse.CategoryStat::categoryName)
                .containsExactlyInAnyOrder("개발", "학습");
    }

    @Test
    @DisplayName("주간 트렌드는 7개의 항목을 반환한다")
    void getStats_weeklyTrendHasSevenDays() {
        given(todoRepository.count()).willReturn(0L);
        given(todoRepository.countByCompleted(true)).willReturn(0L);
        given(todoRepository.findCategoryStats()).willReturn(List.of());
        given(todoRepository.findDailyCompletedBetween(any(), any())).willReturn(List.of());

        StatsResponse result = sut.getStats();

        assertThat(result.weeklyTrend()).hasSize(7);
    }

    @Test
    @DisplayName("월간 트렌드는 해당 월의 일 수만큼 항목을 반환한다")
    void getStats_monthlyTrendMatchesDaysInMonth() {
        given(todoRepository.count()).willReturn(0L);
        given(todoRepository.countByCompleted(true)).willReturn(0L);
        given(todoRepository.findCategoryStats()).willReturn(List.of());
        given(todoRepository.findDailyCompletedBetween(any(), any())).willReturn(List.of());

        StatsResponse result = sut.getStats();

        assertThat(result.monthlyTrend().size()).isBetween(28, 31);
    }
}
