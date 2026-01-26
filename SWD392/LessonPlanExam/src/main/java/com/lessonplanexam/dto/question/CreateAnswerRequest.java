package com.lessonplanexam.dto.question;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAnswerRequest {

    @NotBlank(message = "Answer text is required")
    private String answerText;

    private Boolean isCorrect;

    private String explanation;

    private Integer orderIndex;
}
