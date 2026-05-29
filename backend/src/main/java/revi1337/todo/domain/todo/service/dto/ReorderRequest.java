package revi1337.todo.domain.todo.service.dto;

import java.util.List;

public record ReorderRequest(List<ReorderItem> items) {
    public record ReorderItem(Long id, int position) {}
}
