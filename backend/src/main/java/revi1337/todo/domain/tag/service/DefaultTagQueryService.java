package revi1337.todo.domain.tag.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.domain.tag.repository.TagRepository;
import revi1337.todo.domain.tag.service.dto.TagResponse;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DefaultTagQueryService implements TagQueryService {

    private final TagRepository tagRepository;

    @Override
    public List<TagResponse> findAll() {
        return tagRepository.findAll().stream()
                .map(TagResponse::from)
                .toList();
    }
}
