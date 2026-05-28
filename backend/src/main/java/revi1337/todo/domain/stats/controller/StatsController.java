package revi1337.todo.domain.stats.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import revi1337.todo.common.ApiResponse;
import revi1337.todo.domain.stats.controller.dto.StatsResponse;
import revi1337.todo.domain.stats.controller.dto.StatsResponse.CategoryStat;
import revi1337.todo.domain.stats.controller.dto.StatsResponse.DailyStat;
import revi1337.todo.domain.todo.repository.TodoRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final TodoRepository todoRepository;

    @GetMapping
    public ApiResponse<StatsResponse> stats() {
        long totalCount = todoRepository.count();
        long completedCount = todoRepository.countByCompleted(true);
        double completionRate = totalCount == 0 ? 0.0
                : Math.round((double) completedCount / totalCount * 1000.0) / 10.0;

        List<CategoryStat> byCategory = todoRepository.findCategoryStats();
        List<DailyStat> weeklyTrend = buildWeeklyTrend();
        List<DailyStat> monthlyTrend = buildMonthlyTrend();

        return ApiResponse.ok(new StatsResponse(
                totalCount, completedCount, completionRate,
                byCategory, weeklyTrend, monthlyTrend
        ));
    }

    private List<DailyStat> buildWeeklyTrend() {
        LocalDate monday = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = monday.plusDays(6);

        Map<String, Long> dbData = todoRepository.findDailyCompletedBetween(monday, sunday)
                .stream().collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));

        String[] days = {"MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"};
        List<DailyStat> result = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate date = monday.plusDays(i);
            String dateStr = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
            result.add(new DailyStat(dateStr, days[i], dbData.getOrDefault(dateStr, 0L)));
        }
        return result;
    }

    private List<DailyStat> buildMonthlyTrend() {
        LocalDate first = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth());
        LocalDate last = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth());

        Map<String, Long> dbData = todoRepository.findDailyCompletedBetween(first, last)
                .stream().collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));

        List<DailyStat> result = new ArrayList<>();
        for (LocalDate d = first; !d.isAfter(last); d = d.plusDays(1)) {
            String dateStr = d.format(DateTimeFormatter.ISO_LOCAL_DATE);
            result.add(new DailyStat(dateStr, null, dbData.getOrDefault(dateStr, 0L)));
        }
        return result;
    }
}
