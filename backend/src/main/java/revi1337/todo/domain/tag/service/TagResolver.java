package revi1337.todo.domain.tag.service;

import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;
import revi1337.todo.domain.tag.entity.Tag;
import revi1337.todo.domain.tag.repository.TagJdbcRepository;
import revi1337.todo.domain.tag.repository.TagRepository;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class TagResolver {

    private final TagRepository tagRepository;
    private final TagJdbcRepository tagJdbcRepository;
    private final CachedTagQueryService cachedTagQueryService;

    public TagResolver(TagRepository tagRepository, TagJdbcRepository tagJdbcRepository,
                       CachedTagQueryService cachedTagQueryService) {
        this.tagRepository = tagRepository;
        this.tagJdbcRepository = tagJdbcRepository;
        this.cachedTagQueryService = cachedTagQueryService;
    }

    public Set<Tag> resolve(List<String> tagNames) {
        if (ObjectUtils.isEmpty(tagNames)) {
            return new HashSet<>();
        }
        List<String> normalized = normalize(tagNames);
        Map<String, Tag> tagByName = findExisting(normalized);
        createMissing(normalized, tagByName);
        return new HashSet<>(tagByName.values());
    }

    private List<String> normalize(List<String> tagNames) {
        return tagNames.stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .toList();
    }

    private Map<String, Tag> findExisting(List<String> names) {
        Map<String, Tag> tagByName = new HashMap<>();
        tagRepository.findAllByNameIn(names).forEach(tag -> tagByName.put(tag.getName(), tag));
        return tagByName;
    }

    private void createMissing(List<String> normalized, Map<String, Tag> tagByName) {
        List<String> newNames = normalized.stream()
                .filter(name -> !tagByName.containsKey(name))
                .toList();

        if (!newNames.isEmpty()) {
            tagJdbcRepository.bulkInsert(newNames).forEach(tag -> tagByName.put(tag.getName(), tag));
            cachedTagQueryService.invalidateCache();
        }
    }
}
