package revi1337.todo.domain.tag.service;

import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import revi1337.todo.domain.tag.service.dto.TagResponse;

@Slf4j
@Primary
@Service
public class CachedTagQueryService implements TagQueryService {

    private final TagQueryService delegate;
    private volatile List<TagResponse> cache;

    public CachedTagQueryService(@Qualifier("defaultTagQueryService") TagQueryService tagQueryService) {
        this.delegate = tagQueryService;
    }

    @Override
    public List<TagResponse> findAll() {
        if (cache == null) {
            synchronized (this) {
                if (cache == null) {
                    cache = List.copyOf(delegate.findAll());
                    log.debug("태그 캐시 미스: DB에서 {}건 로드", cache.size());
                }
            }
        }
        log.debug("태그 캐시 히트: {}건", cache.size());
        return cache;
    }

    public synchronized void invalidateCache() {
        this.cache = null;
        log.debug("태그 캐시 무효화");
    }
}
