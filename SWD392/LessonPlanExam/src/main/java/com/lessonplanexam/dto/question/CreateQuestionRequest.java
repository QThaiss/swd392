package com.lessonplanexam.dto.question;

import com.lessonplanexam.enums.EQuestionType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateQuestionRequest {

    @NotNull(message = "Question bank ID is required")
    private Integer questionBankId;

    private Integer questionDifficultyId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    @NotNull(message = "Question type is required")
    private EQuestionType questionType;

    private String additionalData;

    private List<CreateAnswerRequest> answers;
}
