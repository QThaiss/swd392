package com.lessonplanexam.dto.question;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAnswerRequest {

    @NotBlank(message = "Answer text is required")
    private String answerText;

    @JsonProperty("isCorrect")
    private Boolean isCorrect;

    private String explanation;

    private Integer orderIndex;
}
