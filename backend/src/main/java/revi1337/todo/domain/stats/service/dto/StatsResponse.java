package revi1337.todo.domain.stats.service.dto;

import java.util.List;

public record StatsResponse(
        long totalCount,
        long completedCount,
        double completionRate,
        List<CategoryStat> byCategory,
        List<DailyStat> weeklyTrend,
        List<DailyStat> monthlyTrend
) {
    public record CategoryStat(String categoryName, long total, long completed) {}
    public record DailyStat(String date, String day, long count) {}
}
