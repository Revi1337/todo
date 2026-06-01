package revi1337.todo.domain.tag.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import revi1337.todo.domain.tag.service.dto.TagResponse;

import java.util.List;

@Slf4j
@Primary
@Service
public class LoggingTagService implements TagQueryService, TagCommandService {

    private final TagQueryService queryDelegate;
    private final TagCommandService commandDelegate;

    public LoggingTagService(
            @Qualifier("defaultTagQueryService") TagQueryService queryDelegate,
            @Qualifier("defaultTagCommandService") TagCommandService commandDelegate) {
        this.queryDelegate = queryDelegate;
        this.commandDelegate = commandDelegate;
    }

    @Override
    public List<TagResponse> findAll() {
        try {
            return queryDelegate.findAll();
        } catch (RuntimeException e) {
            log.error("태그 목록 조회 중 오류가 발생했습니다", e);
            throw e;
        }
    }

    @Override
    public TagResponse save(String name, String color) {
        try {
            return commandDelegate.save(name, color);
        } catch (RuntimeException e) {
            log.error("태그 생성 중 오류가 발생했습니다. name: {}", name, e);
            throw e;
        }
    }

    @Override
    public TagResponse update(Long id, String name, String color) {
        try {
            return commandDelegate.update(id, name, color);
        } catch (RuntimeException e) {
            log.error("태그 수정 중 오류가 발생했습니다. id: {}", id, e);
            throw e;
        }
    }

    @Override
    public void deleteById(Long id) {
        try {
            commandDelegate.deleteById(id);
        } catch (RuntimeException e) {
            log.error("태그 삭제 중 오류가 발생했습니다. id: {}", id, e);
            throw e;
        }
    }
}
