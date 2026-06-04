package revi1337.todo.domain.tag.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import revi1337.todo.domain.tag.repository.TagRepository;
import revi1337.todo.domain.tag.service.dto.TagResponse;

@Slf4j
@Service
@RequiredArgsConstructor
public class DefaultTagQueryService implements TagQueryService {

    private final TagRepository tagRepository;

    @Override
    public List<TagResponse> findAll() {
        try {
            return tagRepository.findAllByOrderByIdDesc().stream()
                    .map(TagResponse::from)
                    .toList();
        } catch (RuntimeException e) {
            log.error("태그 목록 조회 중 오류가 발생했습니다", e);
            throw e;
        }
    }
}
