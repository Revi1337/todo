package revi1337.todo.domain.tag.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import revi1337.todo.common.ApiResponse;
import revi1337.todo.domain.tag.controller.dto.TagCreateRequest;
import revi1337.todo.domain.tag.entity.Tag;
import revi1337.todo.domain.tag.repository.TagRepository;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagRepository tagRepository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Tag> create(@RequestBody @Valid TagCreateRequest request) {
        return ApiResponse.ok(tagRepository.save(new Tag(request.name(), request.color())));
    }

    @GetMapping
    public ApiResponse<List<Tag>> findAll() {
        return ApiResponse.ok(tagRepository.findAll());
    }
}
