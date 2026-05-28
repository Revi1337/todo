package revi1337.todo.domain.stats.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import revi1337.todo.domain.stats.controller.dto.StatsResponse;
import revi1337.todo.domain.todo.repository.TodoRepository;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(StatsController.class)
class StatsControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private TodoRepository todoRepository;

    @Test
    @DisplayName("GET /api/stats — 통계 정보를 반환한다")
    void stats() throws Exception {
        given(todoRepository.count()).willReturn(10L);
        given(todoRepository.countByCompleted(true)).willReturn(7L);
        given(todoRepository.findCategoryStats()).willReturn(List.of(
                new StatsResponse.CategoryStat("개발", 5L, 3L)
        ));
        given(todoRepository.findDailyCompletedBetween(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
                .willReturn(List.of());

        mockMvc.perform(get("/api/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalCount").value(10))
                .andExpect(jsonPath("$.data.completedCount").value(7))
                .andExpect(jsonPath("$.data.completionRate").value(70.0))
                .andExpect(jsonPath("$.data.byCategory[0].categoryName").value("개발"))
                .andExpect(jsonPath("$.data.weeklyTrend.length()").value(7))
                .andExpect(jsonPath("$.data.monthlyTrend").isArray());
    }

    @Test
    @DisplayName("GET /api/stats — Todo가 없으면 완료율 0을 반환한다")
    void stats_empty() throws Exception {
        given(todoRepository.count()).willReturn(0L);
        given(todoRepository.countByCompleted(true)).willReturn(0L);
        given(todoRepository.findCategoryStats()).willReturn(List.of());
        given(todoRepository.findDailyCompletedBetween(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
                .willReturn(List.of());

        mockMvc.perform(get("/api/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completionRate").value(0.0));
    }
}
