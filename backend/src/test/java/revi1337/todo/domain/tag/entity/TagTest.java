package revi1337.todo.domain.tag.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNullPointerException;

class TagTest {

    @Test
    @DisplayName("정상적인 값으로 Tag를 생성한다")
    void create_success() {
        Tag tag = new Tag("JPA");

        assertThat(tag.getName()).isEqualTo("JPA");
    }

    @Test
    @DisplayName("name이 null이면 NPE를 던진다")
    void create_nullName_throwsNPE() {
        assertThatNullPointerException()
                .isThrownBy(() -> new Tag(null))
                .withMessage("name must not be null");
    }

    @Test
    @DisplayName("update로 이름을 변경한다")
    void update_name() {
        Tag tag = new Tag("JPA");

        tag.update("Kotlin");

        assertThat(tag.getName()).isEqualTo("Kotlin");
    }

    @Test
    @DisplayName("update 시 name이 null이면 NPE를 던진다")
    void update_nullName_throwsNPE() {
        Tag tag = new Tag("JPA");

        assertThatNullPointerException()
                .isThrownBy(() -> tag.update(null))
                .withMessage("name must not be null");
    }
}
