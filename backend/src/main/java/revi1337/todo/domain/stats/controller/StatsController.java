package revi1337.todo.domain.stats.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import revi1337.todo.common.ApiResponse;
import revi1337.todo.domain.stats.service.dto.StatsResponse;
import revi1337.todo.domain.stats.service.StatsQueryService;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsQueryService statsQueryService;

    @GetMapping
    public ApiResponse<StatsResponse> stats() {
        return ApiResponse.ok(statsQueryService.getStats());
    }
}
