package revi1337.todo.domain.tag.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.domain.tag.entity.Tag;
import revi1337.todo.domain.tag.repository.TagRepository;
import revi1337.todo.domain.tag.service.dto.TagResponse;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TagService {

    private final TagRepository tagRepository;

    @Transactional
    public TagResponse save(String name, String color) {
        try {
            return TagResponse.from(tagRepository.save(new Tag(name, color)));
        } catch (RuntimeException e) {
            log.error("태그 생성 중 오류가 발생했습니다. name: {}", name, e);
            throw e;
        }
    }

    public List<TagResponse> findAll() {
        try {
            return tagRepository.findAll().stream()
                    .map(TagResponse::from)
                    .toList();
        } catch (RuntimeException e) {
            log.error("태그 목록 조회 중 오류가 발생했습니다", e);
            throw e;
        }
    }

    @Transactional
    public TagResponse update(Long id, String name, String color) {
        try {
            Tag tag = tagRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Tag not found: " + id));
            tag.update(name, color);
            return TagResponse.from(tag);
        } catch (RuntimeException e) {
            log.error("태그 수정 중 오류가 발생했습니다. id: {}", id, e);
            throw e;
        }
    }

    @Transactional
    public void deleteById(Long id) {
        try {
            if (!tagRepository.existsById(id)) {
                throw new EntityNotFoundException("Tag not found: " + id);
            }
            tagRepository.deleteById(id);
        } catch (RuntimeException e) {
            log.error("태그 삭제 중 오류가 발생했습니다. id: {}", id, e);
            throw e;
        }
    }
}
