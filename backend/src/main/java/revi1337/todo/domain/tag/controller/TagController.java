package revi1337.todo.domain.tag.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import revi1337.todo.common.ApiResponse;
import revi1337.todo.domain.tag.controller.dto.TagCreateRequest;
import revi1337.todo.domain.tag.controller.dto.TagUpdateRequest;
import revi1337.todo.domain.tag.service.TagCommandService;
import revi1337.todo.domain.tag.service.TagQueryService;
import revi1337.todo.domain.tag.service.dto.TagResponse;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagCommandService tagCommandService;
    private final TagQueryService tagQueryService;

    public TagController(@Qualifier("defaultTagCommandService") TagCommandService tagCommandService,
                         @Qualifier("cachedTagQueryService") TagQueryService tagQueryService) {
        this.tagQueryService = tagQueryService;
        this.tagCommandService = tagCommandService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TagResponse> create(@RequestBody @Valid TagCreateRequest request) {
        return ApiResponse.ok(tagCommandService.save(request.name(), request.color()));
    }

    @GetMapping
    public ApiResponse<List<TagResponse>> findAll() {
        return ApiResponse.ok(tagQueryService.findAll());
    }

    @PutMapping("/{id}")
    public ApiResponse<TagResponse> update(@PathVariable Long id, @RequestBody @Valid TagUpdateRequest request) {
        return ApiResponse.ok(tagCommandService.update(id, request.name(), request.color()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        tagCommandService.deleteById(id);
    }
}
