package revi1337.todo.domain.stats.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import revi1337.todo.domain.stats.service.dto.StatsResponse;
import revi1337.todo.domain.stats.service.StatsQueryService;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(StatsController.class)
class StatsControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private StatsQueryService statsQueryService;

    @Test
    @DisplayName("GET /api/stats — 통계 정보를 반환한다")
    void stats() throws Exception {
        given(statsQueryService.getStats()).willReturn(new StatsResponse(
                10L, 7L, 70.0,
                List.of(new StatsResponse.CategoryStat("개발", 5L, 3L)),
                List.of(),
                List.of()
        ));

        mockMvc.perform(get("/api/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalCount").value(10))
                .andExpect(jsonPath("$.data.completedCount").value(7))
                .andExpect(jsonPath("$.data.completionRate").value(70.0))
                .andExpect(jsonPath("$.data.byCategory[0].categoryName").value("개발"))
                .andExpect(jsonPath("$.data.weeklyTrend").isArray())
                .andExpect(jsonPath("$.data.monthlyTrend").isArray());
    }

    @Test
    @DisplayName("GET /api/stats — Todo가 없으면 완료율 0을 반환한다")
    void stats_empty() throws Exception {
        given(statsQueryService.getStats()).willReturn(new StatsResponse(
                0L, 0L, 0.0, List.of(), List.of(), List.of()
        ));

        mockMvc.perform(get("/api/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completionRate").value(0.0));
    }
}
