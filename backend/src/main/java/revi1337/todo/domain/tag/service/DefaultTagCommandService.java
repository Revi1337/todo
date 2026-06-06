package revi1337.todo.domain.tag.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.domain.tag.entity.Tag;
import revi1337.todo.domain.tag.repository.TagRepository;
import revi1337.todo.domain.tag.service.dto.TagResponse;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class DefaultTagCommandService implements TagCommandService {

    private final TagRepository tagRepository;
    private final CachedTagQueryService cachedTagQueryService;

    @Override
    public TagResponse save(String name) {
        try {
            TagResponse response = TagResponse.from(tagRepository.save(new Tag(name)));
            cachedTagQueryService.invalidateCache();
            return response;
        } catch (RuntimeException e) {
            log.error("태그 생성 중 오류가 발생했습니다. name: {}", name, e);
            throw e;
        }
    }

    @Override
    public TagResponse update(Long id, String name) {
        try {
            Tag tag = tagRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Tag not found: " + id));
            tag.update(name);
            TagResponse response = TagResponse.from(tag);
            cachedTagQueryService.invalidateCache();
            return response;
        } catch (RuntimeException e) {
            log.error("태그 수정 중 오류가 발생했습니다. id: {}", id, e);
            throw e;
        }
    }

    @Override
    public void deleteById(Long id) {
        try {
            if (!tagRepository.existsById(id)) {
                throw new EntityNotFoundException("Tag not found: " + id);
            }
            tagRepository.deleteById(id);
            cachedTagQueryService.invalidateCache();
        } catch (RuntimeException e) {
            log.error("태그 삭제 중 오류가 발생했습니다. id: {}", id, e);
            throw e;
        }
    }
}
