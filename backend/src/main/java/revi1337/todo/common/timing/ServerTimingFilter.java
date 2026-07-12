package revi1337.todo.common.timing;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;

@Component
public class ServerTimingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        QueryTimingHolder.reset();
        ContentCachingResponseWrapper wrapper = new ContentCachingResponseWrapper(response);
        try {
            chain.doFilter(request, wrapper);
            long dbTime = QueryTimingHolder.get();
            if (dbTime > 0) {
                wrapper.addHeader("X-Db-Timing", String.valueOf(dbTime));
            }
        } finally {
            wrapper.copyBodyToResponse();
            QueryTimingHolder.reset();
        }
    }
}
