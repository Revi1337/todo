package revi1337.todo.domain.tag.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import revi1337.todo.domain.tag.controller.dto.TagCreateRequest;
import revi1337.todo.domain.tag.service.TagService;
import revi1337.todo.domain.tag.service.dto.TagResponse;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TagController.class)
class TagControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TagService tagService;

    @Test
    @DisplayName("POST /api/tags — Tag를 생성하고 201을 반환한다")
    void create() throws Exception {
        given(tagService.save(any(), any())).willReturn(new TagResponse(1L, "JPA", "#94a3b8"));

        mockMvc.perform(post("/api/tags")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TagCreateRequest("JPA", "#94a3b8"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("JPA"));
    }

    @Test
    @DisplayName("POST /api/tags — name이 blank면 400을 반환한다")
    void create_blankName_returns400() throws Exception {
        mockMvc.perform(post("/api/tags")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TagCreateRequest("", null))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/tags — 전체 목록을 반환한다")
    void findAll() throws Exception {
        given(tagService.findAll()).willReturn(List.of(
                new TagResponse(1L, "JPA", "#94a3b8"),
                new TagResponse(2L, "Spring", "#6366f1")
        ));

        mockMvc.perform(get("/api/tags"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2));
    }
}
