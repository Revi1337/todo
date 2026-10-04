package revi1337.todo.domain.docs;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OpenApiController {

    private final Resource openApiResource = new ClassPathResource("openapi.yml");

    @GetMapping(value = "/docs", produces = "text/plain;charset=UTF-8")
    public ResponseEntity<Resource> getOpenApi() {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/plain;charset=UTF-8"))
                .body(openApiResource);
    }
}
