package revi1337.todo.domain.tag.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import revi1337.todo.domain.tag.entity.Tag;
import revi1337.todo.domain.tag.repository.TagRepository;
import revi1337.todo.domain.tag.service.dto.TagResponse;

@Service
@RequiredArgsConstructor
@Transactional
public class DefaultTagCommandService implements TagCommandService {

    private final TagRepository tagRepository;

    @Override
    public TagResponse save(String name, String color) {
        return TagResponse.from(tagRepository.save(new Tag(name, color)));
    }

    @Override
    public TagResponse update(Long id, String name, String color) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tag not found: " + id));
        tag.update(name, color);
        return TagResponse.from(tag);
    }

    @Override
    public void deleteById(Long id) {
        if (!tagRepository.existsById(id)) {
            throw new EntityNotFoundException("Tag not found: " + id);
        }
        tagRepository.deleteById(id);
    }
}
