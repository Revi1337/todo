package revi1337.todo.domain.tag.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import revi1337.todo.common.ApiResponse;
import revi1337.todo.domain.tag.controller.dto.TagCreateRequest;
import revi1337.todo.domain.tag.service.TagService;
import revi1337.todo.domain.tag.service.dto.TagResponse;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TagResponse> create(@RequestBody @Valid TagCreateRequest request) {
        return ApiResponse.ok(tagService.save(request.name(), request.color()));
    }

    @GetMapping
    public ApiResponse<List<TagResponse>> findAll() {
        return ApiResponse.ok(tagService.findAll());
    }
}
