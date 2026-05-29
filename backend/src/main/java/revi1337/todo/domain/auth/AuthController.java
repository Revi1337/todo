package revi1337.todo.domain.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import revi1337.todo.common.ApiResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final String appPassword;

    public AuthController(@Value("${app.password}") String appPassword) {
        this.appPassword = appPassword;
    }

    @PostMapping("/login")
    public ApiResponse<Void> login(@RequestBody LoginRequest request, HttpSession session) {
        if (!appPassword.equals(request.password())) {
            return ApiResponse.error("비밀번호가 올바르지 않습니다.");
        }
        session.setAttribute(AuthFilter.SESSION_KEY, true);
        return ApiResponse.ok(null);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpSession session, HttpServletResponse response) {
        session.invalidate();
        Cookie cookie = new Cookie("JSESSIONID", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);
        return ApiResponse.ok(null);
    }

    @GetMapping("/me")
    public ApiResponse<Boolean> me(HttpSession session) {
        boolean authenticated = session != null && Boolean.TRUE.equals(session.getAttribute(AuthFilter.SESSION_KEY));
        return ApiResponse.ok(authenticated);
    }
}
