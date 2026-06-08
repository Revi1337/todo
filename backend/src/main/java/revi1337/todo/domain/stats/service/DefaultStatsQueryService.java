package revi1337.todo.domain.stats.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.domain.stats.service.dto.StatsResponse;
import revi1337.todo.domain.stats.service.dto.StatsResponse.CategoryStat;
import revi1337.todo.domain.stats.service.dto.StatsResponse.DailyStat;
import revi1337.todo.domain.todo.repository.TodoRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DefaultStatsQueryService implements StatsQueryService {

    private final TodoRepository todoRepository;

    public DefaultStatsQueryService(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    @Override
    public StatsResponse getStats() {
        long totalCount = todoRepository.count();
        long completedCount = todoRepository.countByCompleted(true);
        double completionRate = totalCount == 0
                ? 0.0
                : Math.round((double) completedCount / totalCount * 1000.0) / 10.0;

        List<CategoryStat> byCategory = todoRepository.findCategoryStats().stream()
                .map(r -> new CategoryStat(r.categoryName(), r.total(), r.completed()))
                .toList();

        return new StatsResponse(totalCount, completedCount, completionRate,
                byCategory, buildWeeklyTrend(), buildMonthlyTrend());
    }

    private List<DailyStat> buildWeeklyTrend() {
        LocalDate monday = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = monday.plusDays(6);
        Map<String, Long> dbData = toDailyMap(monday, sunday);

        String[] days = {"MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"};
        List<DailyStat> result = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            result.add(makeDailyStat(monday.plusDays(i), days[i], dbData));
        }
        return result;
    }

    private List<DailyStat> buildMonthlyTrend() {
        LocalDate first = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth());
        LocalDate last = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth());
        Map<String, Long> dbData = toDailyMap(first, last);

        List<DailyStat> result = new ArrayList<>();
        for (LocalDate d = first; !d.isAfter(last); d = d.plusDays(1)) {
            result.add(makeDailyStat(d, null, dbData));
        }
        return result;
    }

    private Map<String, Long> toDailyMap(LocalDate from, LocalDate to) {
        return todoRepository.findDailyCompletedBetween(from, to)
                .stream().collect(Collectors.toMap(r -> r[0].toString(), r -> (Long) r[1]));
    }

    private DailyStat makeDailyStat(LocalDate date, String day, Map<String, Long> data) {
        String dateStr = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
        return new DailyStat(dateStr, day, data.getOrDefault(dateStr, 0L));
    }
}
