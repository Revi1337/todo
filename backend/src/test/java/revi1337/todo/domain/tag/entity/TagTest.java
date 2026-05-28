package revi1337.todo.domain.tag.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNullPointerException;

class TagTest {

    @Test
    @DisplayName("정상적인 값으로 Tag를 생성한다")
    void create_success() {
        Tag tag = new Tag("JPA", "#94a3b8");

        assertThat(tag.getName()).isEqualTo("JPA");
        assertThat(tag.getColor()).isEqualTo("#94a3b8");
    }

    @Test
    @DisplayName("color가 null이면 기본값을 사용한다")
    void create_nullColor_usesDefault() {
        Tag tag = new Tag("JPA", null);

        assertThat(tag.getColor()).isEqualTo("#94a3b8");
    }

    @Test
    @DisplayName("name이 null이면 NPE를 던진다")
    void create_nullName_throwsNPE() {
        assertThatNullPointerException()
                .isThrownBy(() -> new Tag(null, "#94a3b8"))
                .withMessage("name must not be null");
    }
}
