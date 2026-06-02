package revi1337.todo.domain.category.service;

import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import revi1337.todo.domain.category.service.dto.CategoryResponse;

@Slf4j
@Primary
@Service
public class CachedCategoryQueryService implements CategoryQueryService {

    private final CategoryQueryService delegate;
    private volatile List<CategoryResponse> cache;

    public CachedCategoryQueryService(@Qualifier("defaultCategoryQueryService") CategoryQueryService categoryQueryService) {
        this.delegate = categoryQueryService;
    }

    @Override
    public List<CategoryResponse> findAll() {
        if (cache == null) {
            synchronized (this) {
                if (cache == null) {
                    cache = List.copyOf(delegate.findAll());
                    log.debug("카테고리 캐시 미스: DB에서 {}건 로드", cache.size());
                }
            }
        }
        log.debug("카테고리 캐시 히트: {}건", cache.size());
        return cache;
    }
}
